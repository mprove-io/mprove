import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const kitsTable = pgTable(
  'kits',
  {
    kitId: varchar('kit_id', { length: 32 }).notNull().primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    reportId: varchar('report_id', { length: 32 }).notNull(),
    tab: text('tab'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxKitsServerTs: index('idx_kits_server_ts').on(table.serverTs),
    idxKitsStructId: index('idx_kits_struct_id').on(table.structId),
    idxKitsReportId: index('idx_kits_report_id').on(table.reportId)
  })
);

export type KitEnt = InferSelectModel<typeof kitsTable>;
export type KitEntIns = InferInsertModel<typeof kitsTable>;
