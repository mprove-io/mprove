/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  json,
  pgTable,
  varchar
} from 'drizzle-orm/pg-core';
import { common } from '~backend/barrels/common';

export const structsTable = pgTable(
  'structs',
  {
    structId: varchar('struct_id', { length: 32 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    mproveDirValue: varchar('mprove_dir_value'),
    caseSensitiveStringFilters: boolean('case_sensitive_string_filters'),
    simplifySafeAggregates: boolean('simplify_safe_aggregates'),
    weekStart: varchar('week_start')
      .$type<common.ProjectWeekStartEnum>()
      .notNull(),
    allowTimezones: boolean('allow_timezones').notNull(),
    defaultTimezone: varchar('default_timezone').notNull(),
    formatNumber: varchar('format_number'),
    currencyPrefix: varchar('currency_prefix'),
    currencySuffix: varchar('currency_suffix'),
    errors: json('errors').$type<common.BmlError[]>().notNull(),
    views: json('views').$type<common.View[]>().notNull(),
    stores: json('stores').$type<common.Store[]>(),
    udfsDict: json('udfs_dict').$type<common.UdfsDict>().notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxStructsServerTs: index('idx_structs_server_ts').on(table.serverTs),
    idxStructsProjectId: index('idx_structs_project_id').on(table.projectId)
  })
);

export type StructEnt = InferSelectModel<typeof structsTable>;
export type StructEntIns = InferInsertModel<typeof structsTable>;
