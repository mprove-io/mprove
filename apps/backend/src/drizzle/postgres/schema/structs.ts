import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  json,
  pgTable,
  varchar
} from 'drizzle-orm/pg-core';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { BmlError } from '~common/interfaces/blockml/bml-error';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Preset } from '~common/interfaces/blockml/preset';

export const structsTable = pgTable(
  'structs',
  {
    structId: varchar('struct_id', { length: 32 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    mproveDirValue: varchar('mprove_dir_value'),
    caseSensitiveStringFilters: boolean('case_sensitive_string_filters'),
    simplifySafeAggregates: boolean('simplify_safe_aggregates'),
    weekStart: varchar('week_start').$type<ProjectWeekStartEnum>().notNull(),
    allowTimezones: boolean('allow_timezones').notNull(),
    defaultTimezone: varchar('default_timezone').notNull(),
    formatNumber: varchar('format_number'),
    currencyPrefix: varchar('currency_prefix'),
    currencySuffix: varchar('currency_suffix'),
    thousandsSeparator: varchar('thousands_separator'),
    errors: json('errors').$type<BmlError[]>().notNull(),
    metrics: json('metrics').$type<ModelMetric[]>().default([]),
    presets: json('presets').$type<Preset[]>().default([]),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxStructsServerTs: index('idx_structs_server_ts').on(table.serverTs),
    idxStructsProjectId: index('idx_structs_project_id').on(table.projectId)
  })
);

export type StructEnt = InferSelectModel<typeof structsTable>;
export type StructEntIns = InferInsertModel<typeof structsTable>;
