import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnectionOptions
} from 'typeorm';

import { config } from './barrels/config';
import { constants } from './barrels/constants';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { disk } from './barrels/disk';
import { handler } from './barrels/handler';
import { scheduler } from './barrels/scheduler';
import { start } from './barrels/start';

import { createExpress } from './create-express';

run().catch(e => {
  handler.errorToLog(e);
});

async function run() {
  // read connection options from ormconfig file
  const connectionOptions = <ConnectionOptions>(
    await getConnectionOptions().catch(e =>
      helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_GET_CONNECTION_OPTIONS)
    )
  );

  // override
  Object.assign(connectionOptions, {
    password: process.env.BACKEND_DATABASE_ROOT_PASSWORD,
    database: process.env.BACKEND_DATABASE,
    entities: [__dirname + '/models/store/entities/*.js'],
    migrations: [__dirname + '/migration/*.js']
  });

  // create connection with database
  // note that it's not active database connection
  // TypeORM creates connection pools and uses them for your requests
  const connection = <Connection>(
    await createConnection(connectionOptions).catch(e =>
      helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_CREATE_CONNECTION)
    )
  );

  if (process.env.BACKEND_DROP_DATABASE_ON_START === 'TRUE') {
    await connection
      .dropDatabase()
      .catch(e =>
        helper.reThrow(
          e,
          enums.typeormErrorsEnum.TYPEORM_CONNECTION_DROP_DATABASE
        )
      );

    await connection
      .synchronize()
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_SYNCHRONIZE)
      );

    await disk
      .emptyDir(config.DISK_BACKEND_PROJECTS_PATH)
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));

    await disk
      .emptyDir(config.DISK_BACKEND_BIGQUERY_CREDENTIALS_PATH)
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_EMPTY_DIR));
  } else {
    await connection
      .runMigrations()
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_RUN_MIGRATIONS)
      );
  }

  await start
    .addFirstUser()
    .catch(e => helper.reThrow(e, enums.startErrorsEnum.START_ADD_USERS));

  let itemCreateExpress = createExpress();

  scheduler.runScheduler({ ws_clients: itemCreateExpress.ws_clients });
}
