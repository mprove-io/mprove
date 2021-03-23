import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { entities } from '~backend/barrels/entities';

export function makeConnection(item: {
  projectId: string;
  connectionId: string;
  type: common.ConnectionTypeEnum;
  postgresHost: string;
  postgresPort: number;
  postgresDatabase: string;
  postgresUser: string;
  postgresPassword: string;
  bigqueryCredentials: any;
  bigqueryQuerySizeLimitGb: number;
}) {
  let connectionEntity: entities.ConnectionEntity = {
    project_id: item.projectId,
    connection_id: item.connectionId,
    type: item.type,
    // bigquery
    bigquery_credentials: item.bigqueryCredentials,
    bigquery_project: item.bigqueryCredentials?.project_id,
    bigquery_client_email: item.bigqueryCredentials?.client_email,
    bigquery_query_size_limit_gb:
      common.isDefined(item.bigqueryQuerySizeLimitGb) &&
      item.bigqueryQuerySizeLimitGb > 0
        ? item.bigqueryQuerySizeLimitGb
        : constants.DEFAULT_QUERY_SIZE_LIMIT,
    // postgres
    postgres_host: item.postgresHost,
    postgres_port: item.postgresPort,
    postgres_database: item.postgresDatabase,
    postgres_user: item.postgresUser,
    postgres_password: item.postgresPassword,
    server_ts: undefined
  };
  return connectionEntity;
}
