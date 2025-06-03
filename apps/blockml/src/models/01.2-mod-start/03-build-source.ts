import * as path from 'path';
import { PostgresConnection } from '@malloydata/db-postgres';
import { Model, Runtime } from '@malloydata/malloy';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.BuildSource;

export async function buildSource(
  item: {
    mods: common.FileMod[];
    errors: BmError[];
    tempDir: string;
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newMods: common.FileMod[] = [];

  await forEachSeries(item.mods, async x => {
    let errorsOnStart = item.errors.length;

    //

    let connection =
      x.connection.type === common.ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(x.connection.connectionId, () => ({}), {
            host: x.connection.postgresHost,
            port: x.connection.postgresPort,
            username: x.connection.postgresUsername,
            password: x.connection.postgresPassword,
            databaseName: x.connection.postgresDatabaseName,
            connectionString: x.connection.postgresConnectionString
          })
        : undefined;

    let modelPath = x.location;

    let fullModelPath = `${item.tempDir}/${modelPath}`;
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
      // await fse.readFile(url, 'utf-8')
    };

    let runtime = new Runtime({ urlReader, connection });

    // let mm = await Model.getModelMaterializer(
    //   runtime,
    //   importBaseURL,
    //   modelUrl,
    //   modelPath
    // );

    let mm = runtime.loadModel(modelUrl, { importBaseURL });

    console.log('mm');
    console.log(mm);

    let start = Date.now();

    let malloyModel: Model = await runtime.getModel(modelUrl);

    let end = Date.now();
    let diff = end - start;

    console.log('diff');
    console.log(diff);

    // console.log('mod');
    // console.dir(mod, { depth: null });

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

  return newMods;
}
