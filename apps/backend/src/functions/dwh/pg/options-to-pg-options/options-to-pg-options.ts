import type pg from 'pg-promise/typescript/pg-subset';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';

export function optionsToPgOptions(item: {
  connection: ConnectionTab;
}): pg.IConnectionParameters<pg.IClient> {
  let { connection } = item;

  let connectionOptions: pg.IConnectionParameters<pg.IClient> = {
    host:
      connection.options.postgres.internalHost ||
      connection.options.postgres.host,
    port: connection.options.postgres.internalHost
      ? connection.options.postgres.internalPort
      : connection.options.postgres.port,
    database: connection.options.postgres.database,
    user: connection.options.postgres.username,
    password: connection.options.postgres.password,
    ssl:
      connection.options.postgres.isSSL === true
        ? {
            rejectUnauthorized: false
          }
        : false
  };

  return connectionOptions;
}
