import { PostgresConnection } from '@malloydata/db-postgres';
import {
  Model as MalloyModel,
  ModelDef as MalloyModelDef,
  Runtime as MalloyRuntime,
  SourceDef as MalloySourceDef,
  modelDefToModelInfo
} from '@malloydata/malloy';
import {
  ModelInfo as MalloyModelInfo,
  ModelEntryValueWithSource
} from '@malloydata/malloy-interfaces';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { ErTitleEnum } from '~common/enums/special/er-title.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';
import { WrapResult } from '~common/interfaces/wrap-result';
import { errorToWrapResult } from '~node-common/functions/error-to-wrap-result';
import { getWrapResult } from '~node-common/functions/get-wrap-result';
import { log } from '../extra/log';

let func = FuncEnum.BuildMods;

export async function buildMods(
  item: {
    mods: FileMod[];
    malloyConnections: PostgresConnection[];
    connections: ProjectConnection[];
    tempDir: string;
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, projectId } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newMods: FileMod[] = [];

  let runtime = new MalloyRuntime({
    urlReader: {
      readURL: async (url: URL) => {
        // console.log('url');
        // console.log(url);

        // console.log('projectId');
        // console.log(projectId);

        if (
          url.protocol.toLowerCase().startsWith('file') === true &&
          url.pathname.endsWith('.malloy') === false
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.IMPORT_FROM_NON_MALLOY_FILE,
              message:
                'One or more of ".malloy" files has an import from non-malloy file (not supported by Mprove)',
              lines: [
                {
                  line: 0,
                  name: '*.malloy',
                  path: ''
                }
              ]
            })
          );

          return null;
        }

        let blockmlDataPath =
          cs.get<BlockmlConfig['blockmlData']>('blockmlData');

        if (
          url.protocol.toLowerCase().startsWith('file') === true &&
          (url.pathname.includes(blockmlDataPath) === false ||
            (isDefined(projectId) &&
              url.pathname.includes(projectId) === false))
        ) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_IMPORT_PATH_FOR_MALLOY_FILE,
              message:
                'One or more of ".malloy" files has an import with too many "../" segments or with an absolute path (not supported by Mprove)',
              lines: [
                {
                  line: 0,
                  name: '*.malloy',
                  path: ''
                }
              ]
            })
          );

          return null;
        }

        return await fse.readFile(url, 'utf8');
      }
    },
    connections: {
      lookupConnection: async function (name: string) {
        return item.malloyConnections.find(mc => mc.name === name);
      }
    }
  });

  let promises: Promise<WrapResult<MalloyModel>>[] = [];

  let modelPaths = item.mods.map(mod => mod.blockmlPath);

  let uniqueModelPaths = [...new Set(modelPaths)];

  await forEachSeries(uniqueModelPaths, async x => {
    // let modelPath = x.location;

    // let fullModelPath = isDefined(projectId)
    //   ? `${item.tempDir}/${projectId}/${modelPath}`
    //   : `${item.tempDir}/${modelPath}`;

    let fullModelPath = x;

    let modelUrl = new URL('file://' + fullModelPath);

    promises.push(
      getWrapResult<MalloyModel>({
        promise: runtime.getModel(modelUrl)
      }).catch(e => errorToWrapResult<MalloyModel>(e))
    );
  });

  let wrapResults: WrapResult<MalloyModel>[] = await Promise.all(promises);

  // console.log('wrapResults');
  // console.dir(wrapResults, { depth: 4 });

  await forEachSeries(item.mods, async x => {
    let errorsOnStart = item.errors.length;

    let index = uniqueModelPaths.findIndex(p => p === x.blockmlPath);

    let wrapResult = wrapResults[index];

    if (isDefined(wrapResult.error)) {
      console.log('x.fileName');
      console.log(x.fileName);

      console.log('x.filePath');
      console.log(x.filePath);

      // DXYE72ODCP5LWPWH2EXQ/data/c1_postgres/models/c1_order_items.malloy

      console.log('wrapResult.error');
      console.log(wrapResult.error);

      console.log('wrapResult.error.problems[0].at');
      console.log(wrapResult.error.problems[0].at);

      // {
      //   url: 'file:///mprove/mprove_data/blockml-data/1757396037512-GXTALX3WVY8DEQPPTWAU/DXYE72ODCP5LWPWH2EXQ/data/c1_postgres/models/c1_order_items.malloy',
      //   range: { start: { line: 3, character: 7 }, end: { line: 3, character: 57 } }
      // }

      item.errors.push(
        new BmError({
          title: ErTitleEnum.FAILED_TO_COMPILE_MALLOY,
          message: wrapResult.errorStr,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    x.malloyModel = wrapResult.data;

    let malloyModelDef: MalloyModelDef = x.malloyModel._modelDef;

    // export type SourceDef = TableSourceDef | SQLSourceDef | QuerySourceDef | QueryResultDef | FinalizeSourceDef | NestSourceDef | CompositeSourceDef;
    let sourceDef: MalloySourceDef = malloyModelDef.contents[
      x.source
    ] as MalloySourceDef;

    // fse.writeFileSync(
    //   `${x.source}-source-def.json`,
    //   JSON.stringify(sourceDef, null, 2),
    //   'utf-8'
    // );

    let modelInfo: MalloyModelInfo = modelDefToModelInfo(malloyModelDef);

    x.connection = item.connections.find(
      c => c.connectionId === sourceDef.connection
    );

    x.valueWithSourceInfo = modelInfo.entries.find(
      entry => entry.kind === 'source' && entry.name === x.source
    ) as ModelEntryValueWithSource;

    // console.log('x.valueWithSourceInfo');
    // console.dir(x.valueWithSourceInfo, { depth: null });

    // fse.writeFileSync(
    //   `${x.source}-source-info.json`,
    //   JSON.stringify(x.valueWithSourceInfo, null, 2),
    //   'utf-8'
    // );

    // let explore = x.malloyModel.getExploreByName(x.source);
    // console.dir(explore, { depth: 3 });

    if (errorsOnStart === item.errors.length) {
      newMods.push(x);
    }
  });

  // console.log('item.errors');
  // console.log(item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Mods, newMods);

  return newMods;
}
