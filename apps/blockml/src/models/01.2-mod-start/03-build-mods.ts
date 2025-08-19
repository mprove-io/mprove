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
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { BmError } from '~blockml/models/bm-error';
import { WrapResult } from '~common/interfaces/wrap-result';

let func = common.FuncEnum.BuildMods;

export async function buildMods(
  item: {
    mods: common.FileMod[];
    malloyConnections: PostgresConnection[];
    connections: common.ProjectConnection[];
    tempDir: string;
    projectId: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, projectId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newMods: common.FileMod[] = [];

  let runtime = new MalloyRuntime({
    urlReader: {
      readURL: async (url: URL) => await fse.readFile(url, 'utf8')
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

    // let fullModelPath = common.isDefined(projectId)
    //   ? `${item.tempDir}/${projectId}/${modelPath}`
    //   : `${item.tempDir}/${modelPath}`;

    let fullModelPath = x;

    let modelUrl = new URL('file://' + fullModelPath);

    promises.push(
      nodeCommon
        .getWrapResult<MalloyModel>({
          promise: runtime.getModel(modelUrl)
        })
        .catch(e => nodeCommon.errorToWrapResult<MalloyModel>(e))
    );
  });

  let wrapResults: WrapResult<MalloyModel>[] = await Promise.all(promises);

  // console.log('wrapResults');
  // console.dir(wrapResults, { depth: 4 });

  await forEachSeries(item.mods, async x => {
    let errorsOnStart = item.errors.length;

    let index = uniqueModelPaths.findIndex(p => p === x.blockmlPath);

    let wrapResult = wrapResults[index];

    if (common.isDefined(wrapResult.error)) {
      let blockmlDataPath =
        cs.get<interfaces.Config['blockmlData']>('blockmlData');

      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.FAILED_TO_COMPILE_MALLOY,
          message: wrapResult.errorStr.includes(blockmlDataPath) // TODO: check logic
            ? wrapResult.errorStr
            : 'To see error message, use Malloy vscode extension',
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );

      // console.log('MOD_COMPILATION_FAILED'); // TODO: remove
      // console.log(wrapResult.error); // TODO: remove

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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Mods, newMods);

  return newMods;
}
