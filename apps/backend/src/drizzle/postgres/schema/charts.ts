import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  json,
  pgTable,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';

export const chartsTable = pgTable(
  'charts',
  {
    chartFullId: varchar('chart_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    chartId: varchar('chart_id', { length: 32 }).notNull(), // name
    title: varchar('title').notNull(),
    chartType: varchar('chart_type').$type<ChartTypeEnum>(),
    modelId: varchar('model_id', { length: 64 }).notNull(),
    modelLabel: varchar('model_label').notNull(),
    filePath: varchar('file_path'),
    accessRoles: json('access_roles').$type<string[]>().notNull(),
    gr: varchar('gr'),
    hidden: boolean('hidden').notNull(),
    tiles: json('tiles').$type<Tile[]>().notNull(),
    creatorId: varchar('creator_id', { length: 32 }), // user_id
    draft: boolean('draft'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxChartsServerTs: index('idx_charts_server_ts').on(table.serverTs),
    idxChartsStructId: index('idx_charts_struct_id').on(table.structId),
    idxChartsChartId: index('idx_charts_chart_id').on(table.chartId),
    idxChartsModelId: index('idx_charts_model_id').on(table.modelId),
    //
    uidxChartsStructIdChartId: uniqueIndex('uidx_charts_struct_id_chart_id').on(
      table.structId,
      table.chartId
    )
  })
);

export type ChartEnt = InferSelectModel<typeof chartsTable>;
export type ChartEntIns = InferInsertModel<typeof chartsTable>;
