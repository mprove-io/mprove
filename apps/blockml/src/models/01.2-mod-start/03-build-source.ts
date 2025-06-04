import * as path from 'path';
import { PostgresConnection } from '@malloydata/db-postgres';
import {
  Model,
  ModelMaterializer,
  Runtime,
  modelDefToModelInfo
} from '@malloydata/malloy';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { BmError } from '~blockml/models/bm-error';
import { MalloyItem } from '~common/interfaces/blockml/internal/malloy-item';

let func = common.FuncEnum.BuildSource;

export async function buildSource(
  item: {
    mods: common.FileMod[];
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
  let malloyItems: MalloyItem[] = [];

  await forEachSeries(item.mods, async x => {
    let errorsOnStart = item.errors.length;

    let connectionModelItem = malloyItems.find(
      y =>
        y.connectionId === x.connection.connectionId &&
        y.location === x.location
    );

    if (common.isDefined(connectionModelItem)) {
      return;
    }

    let connection =
      x.connection.type === common.ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(x.connection.connectionId, () => ({}), {
            host: x.connection.host,
            port: x.connection.port,
            username: x.connection.username,
            password: x.connection.password,
            databaseName: x.connection.databaseName
          })
        : undefined;

    // console.log('x.connection');
    // console.log(x.connection);
    // console.log('connection');
    // console.log(connection);

    let modelPath = x.location;

    let fullModelPath = common.isDefined(projectId)
      ? `${item.tempDir}/${projectId}/${modelPath}`
      : `${item.tempDir}/${modelPath}`;

    let modelUrl = new URL('file://' + fullModelPath);
    let importBaseURL = new URL('file://' + path.dirname(fullModelPath) + '/');

    let urlReader = {
      readURL: async (url: URL) =>
        (
          await nodeCommon.readFileCheckSize({
            filePath: url,
            getStat: false
          })
        ).content
    };

    let runtime = new Runtime({ urlReader, connection });

    let malloyModelMaterializer: ModelMaterializer = runtime.loadModel(
      modelUrl,
      { importBaseURL }
    );

    let start = Date.now();

    let malloyModel: Model = await runtime.getModel(modelUrl);

    let malloyModelDef = (await malloyModelMaterializer.getModel())._modelDef;
    let malloyModelInfo = modelDefToModelInfo(malloyModelDef);

    // console.log('malloyModelDef');
    // console.log(malloyModelDef);

    console.log('malloyModelInfo');
    console.dir(malloyModelInfo, { depth: null });

    let newConnectionModelItem: MalloyItem = {
      location: x.location,
      connectionId: x.connection.connectionId,
      malloyModel: malloyModel,
      malloyModelMaterializer: malloyModelMaterializer,
      malloyModelDef: malloyModelDef,
      malloyModelInfo: malloyModelInfo
    };

    malloyItems.push(newConnectionModelItem);

    let end = Date.now();
    let diff = end - start;

    console.log('diff');
    console.log(diff);

    // console.log('malloyModel');
    // console.dir(malloyModel, { depth: null });

    // console.log('malloyModelMaterializer');
    // console.log(malloyModelMaterializer);

    if (errorsOnStart === item.errors.length) {
      newMods.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Mods, newMods);

  return { mods: newMods, malloyItems: malloyItems };
}
