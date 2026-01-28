import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { KitLt, KitSt } from '#common/interfaces/st-lt';

export const kitsTable = pgTable(
  'kits',
  {
    kitId: varchar('kit_id', { length: 32 }).notNull().primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    reportId: varchar('report_id', { length: 32 }).notNull(),
    st: json('st').$type<{ encrypted: string; decrypted: KitSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: KitLt }>().notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxKitsServerTs: index('idx_kits_server_ts').on(table.serverTs),
    idxKitsStructId: index('idx_kits_struct_id').on(table.structId),
    idxKitsReportId: index('idx_kits_report_id').on(table.reportId),
    idxKitsKeyTag: index('idx_kits_key_tag').on(table.keyTag)
  })
);

export type KitEnt = InferSelectModel<typeof kitsTable>;
export type KitEntIns = InferInsertModel<typeof kitsTable>;
