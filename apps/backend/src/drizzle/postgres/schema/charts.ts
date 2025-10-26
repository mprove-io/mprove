import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ChartLt, ChartSt } from '~common/interfaces/st-lt';

export const chartsTable = pgTable(
  'charts',
  {
    chartFullId: varchar('chart_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    chartId: varchar('chart_id', { length: 32 }).notNull(), // name
    modelId: varchar('model_id', { length: 64 }).notNull(),
    creatorId: varchar('creator_id', { length: 32 }), // user_id
    chartType: varchar('chart_type').$type<ChartTypeEnum>(),
    draft: boolean('draft'),
    st: json('st').$type<{ encrypted: string; decrypted: ChartSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: ChartLt }>().notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxChartsServerTs: index('idx_charts_server_ts').on(table.serverTs),
    idxChartsStructId: index('idx_charts_struct_id').on(table.structId),
    idxChartsChartId: index('idx_charts_chart_id').on(table.chartId),
    idxChartsModelId: index('idx_charts_model_id').on(table.modelId),
    idxChartsKeyTag: index('idx_charts_key_tag').on(table.keyTag),
    //
    uidxChartsStructIdChartId: uniqueIndex('uidx_charts_struct_id_chart_id').on(
      table.structId,
      table.chartId
    )
  })
);

export type ChartEnt = InferSelectModel<typeof chartsTable>;
export type ChartEntIns = InferInsertModel<typeof chartsTable>;
