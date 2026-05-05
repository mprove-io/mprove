import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';

export type CachedColumnStatus = 'running' | 'completed' | 'error';

export const cachedColumnsTable = pgTable(
  'cached_columns',
  {
    projectId: varchar('project_id').notNull(),
    connectionId: varchar('connection_id').notNull(),
    envId: varchar('env_id').notNull(),
    schemaName: text('schema_name').notNull(),
    tableName: text('table_name').notNull(),
    columnName: text('column_name').notNull(),
    requestedByUserId: varchar('requested_by_user_id'),
    status: varchar('status').$type<CachedColumnStatus>().notNull(),
    errorMessage: text('error_message'),
    startedTs: bigint('started_ts', { mode: 'number' }).notNull(),
    completedTs: bigint('completed_ts', { mode: 'number' }),
    completedDurationMs: bigint('completed_duration_ms', { mode: 'number' }),
    limit: integer('limit').notNull(),
    isLimitReached: boolean('is_limit_reached'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxCachedColumnsProjectId: index('idx_cached_columns_project_id').on(
      table.projectId
    ),
    idxCachedColumnsConnectionId: index('idx_cached_columns_connection_id').on(
      table.connectionId
    ),
    idxCachedColumnsEnvId: index('idx_cached_columns_env_id').on(table.envId),
    idxCachedColumnsSchemaName: index('idx_cached_columns_schema_name').on(
      table.schemaName
    ),
    idxCachedColumnsTableName: index('idx_cached_columns_table_name').on(
      table.tableName
    ),
    idxCachedColumnsColumnName: index('idx_cached_columns_column_name').on(
      table.columnName
    ),
    idxCachedColumnsStatus: index('idx_cached_columns_status').on(table.status),
    idxCachedColumnsLookup: index('idx_cached_columns_lookup').on(
      table.projectId,
      table.connectionId,
      table.envId,
      table.schemaName,
      table.tableName,
      table.columnName
    ),
    idxCachedColumnsServerTs: index('idx_cached_columns_server_ts').on(
      table.serverTs
    )
  })
);

export type CachedColumnsEnt = InferSelectModel<typeof cachedColumnsTable>;
export type CachedColumnsEntIns = InferInsertModel<typeof cachedColumnsTable>;
