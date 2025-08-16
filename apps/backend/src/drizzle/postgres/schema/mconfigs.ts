import { CompiledQuery } from '@malloydata/malloy/dist/model';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  pgTable,
  varchar
} from 'drizzle-orm/pg-core';
import { common } from '~backend/barrels/common';

export const mconfigsTable = pgTable(
  'mconfigs',
  {
    mconfigId: varchar('mconfig_id', { length: 32 }).notNull().primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    queryId: varchar('query_id', { length: 64 }).notNull(),
    modelId: varchar('model_id', { length: 64 }).notNull(),
    modelType: varchar('model_type').$type<common.ModelTypeEnum>(),
    // isStoreModel: boolean('is_store_model'),
    dateRangeIncludesRightSide: boolean('date_range_includes_right_side'),
    storePart: json('store_part').$type<common.StorePart>(),
    modelLabel: varchar('model_label'),
    modelFilePath: varchar('model_file_path'),
    malloyQuery: varchar('malloy_query'),
    compiledQuery: json('compiled_query').$type<CompiledQuery>(),
    select: json('select').$type<string[]>().notNull(),
    // unsafeSelect: json('unsafe_select').$type<string[]>(),
    // warnSelect: json('warn_select').$type<string[]>(),
    // joinAggregations:
    //   json('join_aggregations').$type<common.JoinAggregation[]>(),
    sortings: json('sortings').$type<common.Sorting[]>().notNull(),
    sorts: varchar('sorts'),
    timezone: varchar('timezone').notNull(),
    limit: integer('limit').notNull(),
    filters: json('filters').$type<common.Filter[]>().notNull(),
    chart: json('chart').$type<common.MconfigChart>().notNull(),
    temp: boolean('temp').notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxMconfigsServerTs: index('idx_mconfigs_server_ts').on(table.serverTs),
    idxMconfigsStructId: index('idx_mconfigs_struct_id').on(table.structId),
    idxMconfigsQueryId: index('idx_mconfigs_query_id').on(table.queryId)
  })
);

export type MconfigEnt = InferSelectModel<typeof mconfigsTable>;
export type MconfigEntIns = InferInsertModel<typeof mconfigsTable>;
