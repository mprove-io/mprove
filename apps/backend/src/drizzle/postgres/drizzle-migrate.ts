import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import type { ClientConfig } from 'pg';
import pg from 'pg';

const { Client } = pg;
import 'reflect-metadata';

async function start() {
  let clientConfig: ClientConfig = {
    connectionString: process.env.CLI_DRIZZLE_POSTGRES_DATABASE_URL,
    ssl:
      process.env.CLI_DRIZZLE_IS_POSTGRES_TLS === 'TRUE'
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
