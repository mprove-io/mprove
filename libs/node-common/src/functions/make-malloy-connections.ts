import { BigQueryConnection } from '@malloydata/db-bigquery';
import { DuckDBConnection } from '@malloydata/db-duckdb';
import { PostgresConnection } from '@malloydata/db-postgres';
import { SnowflakeConnection } from '@malloydata/db-snowflake';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';

export type MalloyConnection =
  | PostgresConnection
  | BigQueryConnection
  | SnowflakeConnection
  | DuckDBConnection;

export function makeMalloyConnections(item: {
  connections: ProjectConnection[];
}) {
  let malloyConnections: MalloyConnection[] = [];

  item.connections.forEach(c => {
    // TODO: more connection types

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
      c.type === ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(c.connectionId, () => ({}), {
            host: c.postgresOptions.host,
            port: c.postgresOptions.port,
            username: c.postgresOptions.username,
            password: c.postgresOptions.password,
            databaseName: c.postgresOptions.database
          })
        : c.type === ConnectionTypeEnum.BigQuery
          ? new BigQueryConnection(c.connectionId, () => ({}), {
              credentials: c.bigqueryOptions.serviceAccountCredentials,
              projectId: c.bigqueryOptions.googleCloudProject
            })
          : c.type === ConnectionTypeEnum.SnowFlake
            ? new SnowflakeConnection(c.connectionId, {
                connOptions: {
                  account: c.snowflakeOptions.account,
                  warehouse: c.snowflakeOptions.warehouse,
                  database: c.snowflakeOptions.database,
                  username: c.snowflakeOptions.username,
                  password: c.snowflakeOptions.password
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
            : c.type === ConnectionTypeEnum.MotherDuck
              ? new DuckDBConnection({
                  name: c.connectionId,
                  databasePath: isDefined(c.motherduckOptions.database)
                    ? `md:${c.motherduckOptions.database}`
                    : `md:`,
                  motherDuckToken: c.motherduckOptions.motherduckToken
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
