import { BigQueryConnection } from '@malloydata/db-bigquery';
import { PostgresConnection } from '@malloydata/db-postgres';
// import { SnowflakeConnection } from '@malloydata/db-snowflake';
import { SnowflakeConnection } from '@malloydata/db-snowflake';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';

export type MalloyConnection =
  | PostgresConnection
  | BigQueryConnection
  | SnowflakeConnection;

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
            host: c.host,
            port: c.port,
            username: c.username,
            password: c.password,
            databaseName: c.database
          })
        : c.type === ConnectionTypeEnum.BigQuery
          ? new BigQueryConnection(c.connectionId, () => ({}), {
              credentials: c.serviceAccountCredentials,
              projectId: c.googleCloudProject
            })
          : c.type === ConnectionTypeEnum.SnowFlake
            ? new SnowflakeConnection(c.connectionId, {
                connOptions: {
                  account: c.account,
                  warehouse: c.warehouse,
                  username: c.username,
                  password: c.password
                  //  database?: string | undefined;
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
            : undefined;

    if (isDefined(mConnection)) {
      malloyConnections.push(mConnection);
    }

    return mConnection;
  });

  return malloyConnections;
}
