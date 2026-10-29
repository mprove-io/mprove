import type * as MYSQL from 'mysql2/promise';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';

export function optionsToMysqlOptions(item: {
  connection: ConnectionTab;
}): MYSQL.ConnectionOptions {
  let { connection } = item;

  let connectionOptions: MYSQL.ConnectionOptions = {
    host:
      connection.options.mysql.internalHost || connection.options.mysql.host,
    port: connection.options.mysql.internalHost
      ? connection.options.mysql.internalPort
      : connection.options.mysql.port,
    database: connection.options.mysql.database,
    user: connection.options.mysql.user,
    password: connection.options.mysql.password,
    multipleStatements: true,
    decimalNumbers: true,
    timezone: '+00:00'
  };

  return connectionOptions;
}
