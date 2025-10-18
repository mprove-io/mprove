import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { MconfigLt, MconfigSt } from '~common/interfaces/st-lt';

export const mconfigsTable = pgTable(
  'mconfigs',
  {
    mconfigId: varchar('mconfig_id', { length: 32 }).notNull().primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    queryId: varchar('query_id', { length: 64 }).notNull(),
    modelId: varchar('model_id', { length: 64 }).notNull(),
    modelType: varchar('model_type').$type<ModelTypeEnum>(),
    parentType: varchar('parent_type').$type<MconfigParentTypeEnum>(),
    parentId: varchar('parent_id', { length: 32 }),
    // dateRangeIncludesRightSide: boolean('date_range_includes_right_side'),
    // storePart: json('store_part').$type<StorePart>(),
    // modelLabel: varchar('model_label'),
    // modelFilePath: varchar('model_file_path'),
    // malloyQueryStable: varchar('malloy_query_stable'),
    // malloyQueryExtra: varchar('malloy_query_extra'),
    // compiledQuery: json('compiled_query').$type<CompiledQuery>(),
    // select: json('select').$type<string[]>().notNull(),
    // sortings: json('sortings').$type<Sorting[]>().notNull(),
    // sorts: varchar('sorts'),
    // timezone: varchar('timezone').notNull(),
    // limit: integer('limit').notNull(),
    // filters: json('filters').$type<Filter[]>().notNull(),
    // chart: json('chart').$type<MconfigChart>().notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: MconfigSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: MconfigLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxMconfigsServerTs: index('idx_mconfigs_server_ts').on(table.serverTs),
    idxMconfigsStructId: index('idx_mconfigs_struct_id').on(table.structId),
    idxMconfigsQueryId: index('idx_mconfigs_query_id').on(table.queryId),
    idxMconfigsKeyTag: index('idx_mconfigs_key_tag').on(table.keyTag)
  })
);

export type MconfigEnt = InferSelectModel<typeof mconfigsTable>;
export type MconfigEntIns = InferInsertModel<typeof mconfigsTable>;
