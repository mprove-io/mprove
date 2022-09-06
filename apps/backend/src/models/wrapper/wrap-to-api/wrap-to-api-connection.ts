import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiConnection(
  x: entities.ConnectionEntity
): common.Connection {
  return {
    projectId: x.project_id,
    connectionId: x.connection_id,
    type: x.type,
    bigqueryProject: x.bigquery_project,
    bigqueryClientEmail: x.bigquery_client_email,
    bigqueryQuerySizeLimitGb: x.bigquery_query_size_limit_gb,
    account: x.account,
    warehouse: x.warehouse,
    host: x.host,
    port: x.port,
    database: x.database,
    username: x.username,
    isSSL: common.enumToBoolean(x.is_ssl),
    serverTs: Number(x.server_ts)
  };
}
