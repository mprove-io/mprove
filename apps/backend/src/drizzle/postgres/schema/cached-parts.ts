import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  integer,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import type { CachedPartLt, CachedPartSt } from '#common/zod/st-lt';

export const cachedPartsTable = pgTable(
  'cached_parts',
  {
    cachedPartFullId: varchar('cached_part_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id').notNull(),
    connectionId: varchar('connection_id').notNull(),
    envId: varchar('env_id').notNull(),
    schemaNameLc: text('schema_name_lc').notNull(),
    tableNameLc: text('table_name_lc').notNull(),
    columnNameLc: text('column_name_lc').notNull(),
    columnValue: text('column_value'),
    columnValueLc: text('column_value_lc'),
    count: integer('count').notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: CachedPartSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: CachedPartLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxCachedPartsProjectId: index('idx_cached_parts_project_id').on(
      table.projectId
    ),
    idxCachedPartsConnectionId: index('idx_cached_parts_connection_id').on(
      table.connectionId
    ),
    idxCachedPartsEnvId: index('idx_cached_parts_env_id').on(table.envId),
    idxCachedPartsSchemaNameLc: index('idx_cached_parts_schema_name_lc').on(
      table.schemaNameLc
    ),
    idxCachedPartsTableNameLc: index('idx_cached_parts_table_name_lc').on(
      table.tableNameLc
    ),
    idxCachedPartsColumnNameLc: index('idx_cached_parts_column_name_lc').on(
      table.columnNameLc
    ),
    idxCachedPartsColumnValueLc: index('idx_cached_parts_column_value_lc').on(
      table.columnValueLc
    ),
    idxCachedPartsKeyTag: index('idx_cached_parts_key_tag').on(table.keyTag),
    idxCachedPartsGetColumnValues: index(
      'idx_cached_parts_get_column_values'
    ).on(
      table.projectId,
      table.connectionId,
      table.envId,
      table.schemaNameLc,
      table.tableNameLc,
      table.columnNameLc
    ),
    idxCachedPartsSearchValue: index('idx_cached_parts_search_value').on(
      table.projectId,
      table.envId,
      table.columnValueLc
    ),
    idxCachedPartsServerTs: index('idx_cached_parts_server_ts').on(
      table.serverTs
    )
  })
);

export type CachedPartsEnt = InferSelectModel<typeof cachedPartsTable>;
export type CachedPartsEntIns = InferInsertModel<typeof cachedPartsTable>;
