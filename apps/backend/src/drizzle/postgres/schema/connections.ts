/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  pgTable,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { common } from '~backend/barrels/common';

export const connectionsTable = pgTable(
  'connections',
  {
    connectionFullId: varchar('connection_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    envId: varchar('env_id', { length: 32 }).notNull(), // name
    connectionId: varchar('connection_id', { length: 32 }).notNull(), // name
    type: varchar('type').$type<common.ConnectionTypeEnum>().notNull(),
    bigqueryQuerySizeLimitGb: integer('bigquery_query_size_limit_gb'),
    serviceAccountCredentials: json('service_account_credentials'),
    googleCloudProject: varchar('google_cloud_project'),
    googleCloudClientEmail: varchar('google_cloud_client_email'),
    account: varchar('account'),
    warehouse: varchar('warehouse'),
    host: varchar('host'),
    port: integer('port'),
    database: varchar('database'),
    username: varchar('username'),
    password: varchar('password'),
    isSsl: boolean('is_ssl'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxConnectionsServerTs: index('idx_connections_server_ts').on(
      table.serverTs
    ),
    idxConnectionsProjectId: index('idx_connections_project_id').on(
      table.projectId
    ),
    idxConnectionsEnvId: index('idx_connections_env_id').on(table.envId),
    idxConnectionsConnectionId: index('idx_connections_connection_id').on(
      table.connectionId
    ),
    //
    uidxConnectionsProjectIdEnvIdConnectionId: uniqueIndex(
      'uidx_connections_project_id_env_id_connection_id'
    ).on(table.projectId, table.envId, table.connectionId)
  })
);

export type ConnectionEnt = InferSelectModel<typeof connectionsTable>;
export type ConnectionEntIns = InferInsertModel<typeof connectionsTable>;
