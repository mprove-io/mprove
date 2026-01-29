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
import fse from 'fs-extra';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { ProjectConnection } from '#common/interfaces/backend/project-connection';
import { FileMod } from '#common/interfaces/blockml/internal/file-mod';
import { WrapResult } from '#common/interfaces/wrap-result';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { errorToWrapResult } from '#node-common/functions/error-to-wrap-result';
import { getWrapResult } from '#node-common/functions/get-wrap-result';
import { MalloyConnection } from '#node-common/functions/make-malloy-connections';
import { log } from '../extra/log';

let func = FuncEnum.BuildMods;

export async function buildMods(
  item: {
    mods: FileMod[];
    malloyConnections: MalloyConnection[];
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
    let fullModelPath = x;

    let modelUrl = new URL('file://' + fullModelPath);

    promises.push(
      getWrapResult<MalloyModel>({
        promise: addTraceSpan({
          spanName: 'backend.malloy.getModel',
          fn: () => runtime.getModel(modelUrl)
        })
      }).catch(e => errorToWrapResult<MalloyModel>(e))
    );
  });

  let wrapResults: WrapResult<MalloyModel>[] = await Promise.all(promises);

  await forEachSeries(item.mods, async x => {
    let errorsOnStart = item.errors.length;

    let index = uniqueModelPaths.findIndex(p => p === x.blockmlPath);

    let wrapResult = wrapResults[index];

    if (isDefined(wrapResult.error)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.FAILED_TO_COMPILE_MALLOY,
          message: wrapResult.errorStr,
          lines: isDefined(wrapResult.error.problems)
            ? wrapResult.error.problems
                .filter(
                  (y: any) =>
                    isDefined(y.at?.url) && isDefined(y.at?.range?.start?.line)
                )
                .map((y: any) => {
                  let blockmlDataPath =
                    cs.get<BlockmlConfig['blockmlData']>('blockmlData');

                  blockmlDataPath = blockmlDataPath.endsWith('/')
                    ? blockmlDataPath.slice(0, -1)
                    : blockmlDataPath;

                  let part = y.at.url.split(blockmlDataPath)[1];

                  let partArray = part.split('/');

                  partArray.shift();
                  partArray.shift();

                  let filPath = partArray.join('/');
                  let fileName =
                    partArray[partArray.length - 1] === x.fileName
                      ? x.fileName
                      : `${partArray[partArray.length - 1]} <-- ${x.fileName}`;

                  let line = {
                    line: (y.at.range.start.line as number) + 1,
                    name: fileName,
                    path: filPath
                  };

                  return line;
                })
            : []
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

    // let modelInfo: MalloyModelInfo = addTraceSpanSync({
    //   spanName: 'backend.malloy.modelDefToModelInfo',
    //   fn: () => modelDefToModelInfo(malloyModelDef)
    // });

    let projectConnection = item.connections.find(
      c => c.connectionId === sourceDef.connection
    );

    x.connectionId = projectConnection.connectionId;
    x.connectionType = projectConnection.type;

    x.valueWithSourceInfo = modelInfo.entries.find(
      entry => entry.kind === 'source' && entry.name === x.source
    ) as ModelEntryValueWithSource;

    if (errorsOnStart === item.errors.length) {
      newMods.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Mods, newMods);

  return newMods;
}
