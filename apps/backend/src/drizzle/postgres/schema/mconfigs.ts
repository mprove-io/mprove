/* eslint-disable id-blacklist */
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
    modelId: varchar('model_id', { length: 32 }).notNull(),
    modelLabel: varchar('model_label'),
    select: json('select').$type<string[]>().notNull(),
    sortings: json('sortings').$type<common.Sorting[]>().notNull(),
    sorts: varchar('sorts'),
    timezone: varchar('timezone').notNull(),
    limit: integer('limit').notNull(),
    filters: json('filters').$type<common.Filter[]>().notNull(),
    chart: json('chart').$type<common.Chart>().notNull(),
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
