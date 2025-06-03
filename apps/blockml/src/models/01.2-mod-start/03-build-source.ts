import { PostgresConnection } from '@malloydata/db-postgres';
import { Model, ModelString, Runtime, URLReader } from '@malloydata/malloy';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.BuildSource;

export async function buildSource(
  item: {
    files: common.BmlFile[];
    mods: common.FileMod[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, files } = item;
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

    let urlReader: URLReader = { readURL: async (url: URL) => null };

    let runtime = new Runtime({ urlReader, connection });

    let modelString: ModelString = files.find(
      file => file.path === x.location
    ).content;

    let start = Date.now();
    let mod: Model = await runtime.getModel(modelString);
    let end = Date.now();
    let diff = end - start;

    // console.log('diff');
    // console.log(diff);
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
