import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import type { ClientConfig } from 'pg';
import pg from 'pg';
import 'reflect-metadata';
import type { Bool } from '#common/types/shared/bool';

const { Client } = pg;

async function start() {
  let clientConfig: ClientConfig = {
    connectionString: process.env.CLI_DRIZZLE_POSTGRES_DATABASE_URL,
    ssl:
      process.env.CLI_DRIZZLE_IS_POSTGRES_TLS === ('TRUE' satisfies Bool)
        ? {
            rejectUnauthorized: false
          }
        : false
  };

  let postgresSingleClient = new Client(clientConfig);

  await postgresSingleClient.connect();

  const db = drizzlePg(postgresSingleClient);

  await migratePg(db, {
    migrationsFolder: 'apps/backend/src/drizzle/postgres/migrations'
  });
}

start()
  .then(x => {
    console.log('Complete');
    process.exit(0);
  })
  .catch(e => {
    console.log('Error');
    console.log(e);
    process.exit(1);
  });
