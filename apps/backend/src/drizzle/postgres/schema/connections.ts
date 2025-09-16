import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ConnectionBigqueryOptions } from '~common/interfaces/backend/connection/connection-bigquery-options';
import { ConnectionClickhouseOptions } from '~common/interfaces/backend/connection/connection-clickhouse-options';
import { ConnectionMotherduckOptions } from '~common/interfaces/backend/connection/connection-motherduck-options';
import { ConnectionMysqlOptions } from '~common/interfaces/backend/connection/connection-mysql-options';
import { ConnectionPostgresOptions } from '~common/interfaces/backend/connection/connection-postgres-options';
import { ConnectionSnowflakeOptions } from '~common/interfaces/backend/connection/connection-snowflake-options';
import { ConnectionStoreApiOptions } from '~common/interfaces/backend/connection/connection-store-api-options';
import { ConnectionStoreGoogleApiOptions } from '~common/interfaces/backend/connection/connection-store-google-api-options';

export const connectionsTable = pgTable(
  'connections',
  {
    connectionFullId: varchar('connection_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    envId: varchar('env_id', { length: 32 }).notNull(), // name
    connectionId: varchar('connection_id', { length: 32 }).notNull(), // name
    type: varchar('type').$type<ConnectionTypeEnum>().notNull(),
    postgresOptions:
      json('postgres_options').$type<ConnectionPostgresOptions>(),
    mysqlOptions: json('mysql_options').$type<ConnectionMysqlOptions>(),
    clickhouseOptions:
      json('clickhouse_options').$type<ConnectionClickhouseOptions>(),
    bigqueryOptions:
      json('bigquery_options').$type<ConnectionBigqueryOptions>(),
    snowflakeOptions:
      json('snowflake_options').$type<ConnectionSnowflakeOptions>(),
    motherduckOptions:
      json('motherduck_options').$type<ConnectionMotherduckOptions>(),
    storeApiOptions:
      json('store_api_options').$type<ConnectionStoreApiOptions>(),
    storeGoogleApiOptions: json(
      'store_google_api_options'
    ).$type<ConnectionStoreGoogleApiOptions>(),
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
