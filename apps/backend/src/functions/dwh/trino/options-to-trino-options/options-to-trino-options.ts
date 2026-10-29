import type { TrinoConnectionConfiguration } from '@malloydata/db-trino/dist/trino_connection';
import { BasicAuth, type ConnectionOptions } from 'trino-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';

export function optionsToTrinoOptions(item: {
  connection: ConnectionTab;
}): ConnectionOptions {
  let { connection } = item;

  let prepConnectionOptions: TrinoConnectionConfiguration = {
    server:
      connection.options.trino.internalServer ||
      connection.options.trino.server,
    catalog: connection.options.trino.catalog,
    schema: connection.options.trino.schema,
    user: connection.options.trino.user,
    password: connection.options.trino.password,
    extraConfig: connection.options.trino.extraConfig
  };

  let connectionOptions: ConnectionOptions = {
    server: prepConnectionOptions.server,
    catalog: prepConnectionOptions.catalog,
    schema: prepConnectionOptions.schema,
    auth: new BasicAuth(
      prepConnectionOptions.user,
      prepConnectionOptions.password
    ),
    ...(prepConnectionOptions.extraConfig as Partial<ConnectionOptions>)
  };

  return connectionOptions;
}
