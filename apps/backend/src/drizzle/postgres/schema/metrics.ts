/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { common } from '~backend/barrels/common';

export const metricsTable = pgTable(
  'metrics',
  {
    metricFullId: varchar('metric_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    metricId: varchar('metric_id').notNull(), // name
    topNode: varchar('top_node').notNull(),
    partId: varchar('part_id').notNull(),
    filePath: varchar('file_path').notNull(),
    type: varchar('type').$type<common.MetricTypeEnum>().notNull(),
    label: varchar('label').notNull(),
    topLabel: varchar('top_label').notNull(),
    partNodeLabel: varchar('part_node_label').notNull(),
    partFieldLabel: varchar('part_field_label').notNull(),
    partLabel: varchar('part_label').notNull(),
    timeNodeLabel: varchar('time_node_label').notNull(),
    timeFieldLabel: varchar('time_field_label').notNull(),
    timeLabel: varchar('time_label').notNull(),
    params: json('params').$type<any[]>().notNull(),
    modelId: varchar('model_id'),
    timefieldId: varchar('timefield_id'),
    fieldId: varchar('field_id'),
    fieldClass: varchar('field_class').$type<common.FieldClassEnum>(),
    formula: varchar('formula'),
    sql: varchar('sql'),
    connectionId: varchar('connection_id'),
    description: varchar('description'),
    formatNumber: varchar('format_number'),
    currencyPrefix: varchar('currency_prefix'),
    currencySuffix: varchar('currency_suffix'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxMetricsServerTs: index('idx_metrics_server_ts').on(table.serverTs),
    idxMetricsStructId: index('idx_metrics_struct_id').on(table.structId),
    idxMetricsMetricId: index('idx_metrics_metric_id').on(table.metricId),
    //
    uidxMetricsStructIdMetricId: uniqueIndex(
      'uidx_metrics_struct_id_metric_id'
    ).on(table.structId, table.metricId)
  })
);

export type MetricEnt = InferSelectModel<typeof metricsTable>;
export type MetricEntIns = InferInsertModel<typeof metricsTable>;
