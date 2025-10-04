import { BigQueryConnection } from '@malloydata/db-bigquery';
import { DuckDBConnection } from '@malloydata/db-duckdb';
import { MySQLConnection } from '@malloydata/db-mysql';
import { PostgresConnection } from '@malloydata/db-postgres';
import { SnowflakeConnection } from '@malloydata/db-snowflake';
import { TrinoConnection } from '@malloydata/db-trino';
import { PrestoConnection } from '@malloydata/db-trino';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';

export type MalloyConnection =
  | PostgresConnection
  | BigQueryConnection
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
    // node_modules/@malloydata/db-bigquery/dist/bigquery_connection.d.ts
    //   interface BigQueryConnectionConfiguration {
    //     /** This ID is used for Bigquery Table Normalization */
    //     projectId?: string;
    //     serviceAccountKeyPath?: string;
    //     location?: string;
    //     maximumBytesBilled?: string;
    //     timeoutMs?: string;
    //     billingProjectId?: string;
    //     credentials?: CredentialBody;
    // }

    let mConnection =
      x.type === ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(x.connectionId, () => ({}), {
            host: x.tab.options.postgres?.host,
            port: x.tab.options.postgres?.port,
            username: x.tab.options.postgres?.username,
            password: x.tab.options.postgres?.password,
            databaseName: x.tab.options.postgres?.database
          })
        : x.type === ConnectionTypeEnum.MySQL
          ? new MySQLConnection(
              x.connectionId,
              {
                host: x.tab.options.mysql?.host,
                port: x.tab.options.mysql?.port,
                database: x.tab.options.mysql?.database,
                user: x.tab.options.mysql?.user,
                password: x.tab.options.mysql?.password
              },
              {}
            )
          : x.type === ConnectionTypeEnum.BigQuery
            ? new BigQueryConnection(x.connectionId, () => ({}), {
                credentials: x.tab.options.bigquery?.serviceAccountCredentials,
                projectId: x.tab.options.bigquery?.googleCloudProject
              })
            : x.type === ConnectionTypeEnum.Trino
              ? new TrinoConnection(
                  x.connectionId,
                  {},
                  {
                    server: x.tab.options.trino?.server,
                    port: undefined,
                    catalog: x.tab.options.trino?.catalog,
                    schema: x.tab.options.trino?.schema,
                    user: x.tab.options.trino?.user,
                    password: x.tab.options.trino?.password,
                    extraConfig: x.tab.options.trino?.extraConfig
                  }
                )
              : x.type === ConnectionTypeEnum.Presto
                ? new PrestoConnection(
                    x.connectionId,
                    {},
                    {
                      server: x.tab.options.presto?.server,
                      port: x.tab.options.presto?.port,
                      catalog: x.tab.options.presto?.catalog,
                      schema: x.tab.options.presto?.schema,
                      user: x.tab.options.presto?.user,
                      password: x.tab.options.presto?.password,
                      extraConfig: x.tab.options.presto?.extraConfig
                    }
                  )
                : x.type === ConnectionTypeEnum.SnowFlake
                  ? new SnowflakeConnection(x.connectionId, {
                      connOptions: {
                        account: x.tab.options.snowflake?.account,
                        warehouse: x.tab.options.snowflake?.warehouse,
                        database: x.tab.options.snowflake?.database,
                        username: x.tab.options.snowflake?.username,
                        password: x.tab.options.snowflake?.password
                        //  schema?: string | undefined;
                        //  role?: string | undefined;
                        //  clientSessionKeepAlive?: boolean | undefined;
                        //  clientSessionKeepAliveHeartbeatFrequency?: number | undefined;
                        //  jsTreatIntegerAsBigInt?: boolean | undefined;
                        //  application?: string;
                        //  authenticator?: string;
                        //  token?: string;
                        //  privateKey?: string | Buffer;
                        //  privateKeyPath?: string;
                        //  privateKeyPass?: string;
                      }
                    })
                  : x.type === ConnectionTypeEnum.MotherDuck
                    ? new DuckDBConnection({
                        name: x.connectionId,
                        databasePath: isDefined(
                          x.tab.options.motherduck?.database
                        )
                          ? `md:${x.tab.options.motherduck?.database}`
                          : `md:`,
                        motherDuckToken:
                          x.tab.options.motherduck?.motherduckToken
                        // additionalExtensions?: string[];
                        // workingDirectory?: string;
                        // readOnly?: boolean;
                      })
                    : undefined;

    if (isDefined(mConnection)) {
      malloyConnections.push(mConnection);
    }

    return mConnection;
  });

  return malloyConnections;
}
