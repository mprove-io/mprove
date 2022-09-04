import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { entities } from '~backend/barrels/entities';

export function makeConnection(item: {
  projectId: string;
  connectionId: string;
  type: common.ConnectionTypeEnum;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  account: string;
  bigqueryCredentials: any;
  bigqueryQuerySizeLimitGb: number;
  isSSL: boolean;
}) {
  let connectionEntity: entities.ConnectionEntity = {
    project_id: item.projectId,
    connection_id: item.connectionId,
    type: item.type,
    bigquery_credentials: item.bigqueryCredentials,
    bigquery_project: item.bigqueryCredentials?.project_id,
    bigquery_client_email: item.bigqueryCredentials?.client_email,
    bigquery_query_size_limit_gb:
      common.isDefined(item.bigqueryQuerySizeLimitGb) &&
      item.bigqueryQuerySizeLimitGb > 0
        ? item.bigqueryQuerySizeLimitGb
        : constants.DEFAULT_QUERY_SIZE_LIMIT,
    account: item.account,
    host: item.host,
    port: item.port,
    database: item.database,
    username: item.username,
    password: item.password,
    is_ssl: common.booleanToEnum(item.isSSL),
    server_ts: undefined
  };
  return connectionEntity;
}
