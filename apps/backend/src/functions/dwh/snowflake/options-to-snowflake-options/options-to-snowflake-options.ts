import snowflake from 'snowflake-sdk';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';

export function optionsToSnowflakeOptions(item: {
  connection: ConnectionTab;
}): snowflake.ConnectionOptions {
  let { connection } = item;

  let connectionOptions: snowflake.ConnectionOptions = {
    account: connection.options.snowflake.account,
    warehouse: connection.options.snowflake.warehouse,
    database: connection.options.snowflake.database,
    username: connection.options.snowflake.username,
    password: connection.options.snowflake.password,
    sfRetryMaxLoginRetries: 1 // also in libs/node-common/src/functions/make-malloy-connections.ts
  };

  return connectionOptions;
}
