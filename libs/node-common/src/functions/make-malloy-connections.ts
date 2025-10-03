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
            host: x.options.postgres?.host,
            port: x.options.postgres?.port,
            username: x.options.postgres?.username,
            password: x.options.postgres?.password,
            databaseName: x.options.postgres?.database
          })
        : x.type === ConnectionTypeEnum.MySQL
          ? new MySQLConnection(
              x.connectionId,
              {
                host: x.options.mysql?.host,
                port: x.options.mysql?.port,
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
                    server: x.options.trino?.server,
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
                      server: x.options.presto?.server,
                      port: x.options.presto?.port,
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
                        password: x.options.snowflake?.password
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
                        databasePath: isDefined(x.options.motherduck?.database)
                          ? `md:${x.options.motherduck?.database}`
                          : `md:`,
                        motherDuckToken: x.options.motherduck?.motherduckToken
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
