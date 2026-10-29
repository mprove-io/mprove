import type { PrestoClientConfig } from '@prestodb/presto-js-client';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { isDefined } from '#common/functions/is-defined/is-defined';

export function optionsToPrestoClientConfig(item: {
  connection: ConnectionTab;
}): PrestoClientConfig {
  let { connection } = item;

  let prestoClientConfig: PrestoClientConfig = {
    catalog: connection.options.presto.catalog,
    host:
      connection.options.presto.internalServer ||
      connection.options.presto.server,
    port: connection.options.presto.internalServer
      ? connection.options.presto.internalPort
      : connection.options.presto.port,
    schema: connection.options.presto.schema,
    user: connection.options.presto.user,
    basicAuthentication:
      isDefined(connection.options.presto.user) &&
      isDefined(connection.options.presto.password)
        ? {
            user: connection.options.presto.user,
            password: connection.options.presto.password
          }
        : undefined,
    extraHeaders: { 'X-Presto-Session': 'legacy_unnest=true' }
  };

  return prestoClientConfig;
}
