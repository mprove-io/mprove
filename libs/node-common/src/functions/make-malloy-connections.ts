import { BigQueryConnection } from '@malloydata/db-bigquery';
import { DatabricksConnection } from '@malloydata/db-databricks';
import { DuckDBConnection } from '@malloydata/db-duckdb';
import { MySQLConnection } from '@malloydata/db-mysql';
import { PostgresConnection } from '@malloydata/db-postgres';
import { SnowflakeConnection } from '@malloydata/db-snowflake';
import { PrestoConnection, TrinoConnection } from '@malloydata/db-trino';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ProjectConnection } from '#common/zod/backend/project-connection';

export type MalloyConnection =
  | PostgresConnection
  | BigQueryConnection
  | DatabricksConnection
  | SnowflakeConnection
  | DuckDBConnection
  | MySQLConnection
  | PrestoConnection
  | TrinoConnection;

export function makeMalloyConnections(item: {
  connections: ProjectConnection[];
}) {
  let malloyConnections: MalloyConnection[] = [];

  item.connections.forEach(x => {
    let pgOpts = x.options.postgres;
    let pgUsername = encodeURIComponent(pgOpts?.username ?? '');
    let pgPassword = encodeURIComponent(pgOpts?.password ?? '');
    let pgHost = pgOpts?.internalHost || pgOpts?.host || '';
    let pgPort = pgOpts?.internalHost
      ? pgOpts?.internalPort
      : pgOpts?.port || 5432;
    let pgDatabase = encodeURIComponent(pgOpts?.database ?? '');
    let pgConnectionString = `postgresql://${pgUsername}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;

    if (pgOpts?.isSSL === true) {
      pgConnectionString += '?sslmode=no-verify';
    }

    let mConnection =
      x.type === ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(x.connectionId, () => ({}), {
            connectionString: pgConnectionString
          })
        : x.type === ConnectionTypeEnum.MySQL
          ? new MySQLConnection(
              x.connectionId,
              {
                host: x.options.mysql?.internalHost || x.options.mysql?.host,
                port: x.options.mysql?.internalHost
                  ? x.options.mysql?.internalPort
                  : x.options.mysql?.port,
                database: x.options.mysql?.database,
                user: x.options.mysql?.user,
                password: x.options.mysql?.password
              },
              {}
            )
          : x.type === ConnectionTypeEnum.BigQuery
            ? new BigQueryConnection(x.connectionId, () => ({}), {
                credentials: x.options.bigquery?.serviceAccountCredentials,
                projectId: x.options.bigquery?.googleCloudProject
              })
            : x.type === ConnectionTypeEnum.Trino
              ? new TrinoConnection(
                  x.connectionId,
                  {},
                  {
                    server:
                      x.options.trino?.internalServer ||
                      x.options.trino?.server,
                    port: undefined,
                    catalog: x.options.trino?.catalog,
                    schema: x.options.trino?.schema,
                    user: x.options.trino?.user,
                    password: x.options.trino?.password,
                    extraConfig: x.options.trino?.extraConfig
                  }
                )
              : x.type === ConnectionTypeEnum.Presto
                ? new PrestoConnection(
                    x.connectionId,
                    {},
                    {
                      server:
                        x.options.presto?.internalServer ||
                        x.options.presto?.server,
                      port: x.options.presto?.internalServer
                        ? x.options.presto?.internalPort
                        : x.options.presto?.port,
                      catalog: x.options.presto?.catalog,
                      schema: x.options.presto?.schema,
                      user: x.options.presto?.user,
                      password: x.options.presto?.password,
                      extraConfig: x.options.presto?.extraConfig
                    }
                  )
                : x.type === ConnectionTypeEnum.SnowFlake
                  ? new SnowflakeConnection(x.connectionId, {
                      connOptions: {
                        account: x.options.snowflake?.account,
                        warehouse: x.options.snowflake?.warehouse,
                        database: x.options.snowflake?.database,
                        username: x.options.snowflake?.username,
                        password: x.options.snowflake?.password,
                        sfRetryMaxLoginRetries: 0
                      }
                    })
                  : x.type === ConnectionTypeEnum.MotherDuck
                    ? new DuckDBConnection({
                        name: x.connectionId,
                        databasePath: isDefined(x.options.motherduck?.database)
                          ? `md:${x.options.motherduck?.database}`
                          : `md:`,
                        motherDuckToken: x.options.motherduck?.motherduckToken
                      })
                    : x.type === ConnectionTypeEnum.Databricks
                      ? new DatabricksConnection(x.connectionId, {
                          host:
                            x.options.databricks?.internalHost ||
                            x.options.databricks?.host,
                          path: x.options.databricks?.path,
                          token: x.options.databricks?.token,
                          oauthClientId: x.options.databricks?.oauthClientId,
                          oauthClientSecret:
                            x.options.databricks?.oauthClientSecret,
                          defaultCatalog: x.options.databricks?.defaultCatalog,
                          defaultSchema: x.options.databricks?.defaultSchema
                        })
                      : undefined;

    if (isDefined(mConnection)) {
      malloyConnections.push(mConnection);
    }

    return mConnection;
  });

  return malloyConnections;
}
