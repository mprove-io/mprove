import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import type { CachedColumnLt, CachedColumnSt } from '#common/zod/st-lt';

export type CachedColumnStatus = 'running' | 'completed' | 'error';

export const cachedColumnsTable = pgTable(
  'cached_columns',
  {
    cachedColumnFullId: varchar('cached_column_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id').notNull(),
    connectionId: varchar('connection_id').notNull(),
    envId: varchar('env_id').notNull(),
    schemaNameLc: text('schema_name_lc').notNull(),
    tableNameLc: text('table_name_lc').notNull(),
    columnNameLc: text('column_name_lc').notNull(),
    requestedByUserId: varchar('requested_by_user_id'),
    status: varchar('status').$type<CachedColumnStatus>().notNull(),
    errorMessage: text('error_message'),
    st: json('st')
      .$type<{ encrypted: string; decrypted: CachedColumnSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: CachedColumnLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    startedTs: bigint('started_ts', { mode: 'number' }).notNull(),
    completedTs: bigint('completed_ts', { mode: 'number' }),
    completedDurationMs: bigint('completed_duration_ms', { mode: 'number' }),
    limit: integer('limit').notNull(),
    sampleSize: integer('sample_size'),
    isLimitReached: boolean('is_limit_reached'),
    uniqueValuesCount: integer('unique_values_count'),
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
    idxCachedColumnsSchemaNameLc: index('idx_cached_columns_schema_name_lc').on(
      table.schemaNameLc
    ),
    idxCachedColumnsTableNameLc: index('idx_cached_columns_table_name_lc').on(
      table.tableNameLc
    ),
    idxCachedColumnsColumnNameLc: index('idx_cached_columns_column_name_lc').on(
      table.columnNameLc
    ),
    idxCachedColumnsStatus: index('idx_cached_columns_status').on(table.status),
    idxCachedColumnsKeyTag: index('idx_cached_columns_key_tag').on(
      table.keyTag
    ),
    idxCachedColumnsServerTs: index('idx_cached_columns_server_ts').on(
      table.serverTs
    ),
    uidxCachedColumnsLookup: uniqueIndex('uidx_cached_columns_lookup').on(
      table.projectId,
      table.connectionId,
      table.envId,
      table.schemaNameLc,
      table.tableNameLc,
      table.columnNameLc
    )
  })
);

export type CachedColumnsEnt = InferSelectModel<typeof cachedColumnsTable>;
export type CachedColumnsEntIns = InferInsertModel<typeof cachedColumnsTable>;
