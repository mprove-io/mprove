/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, json, pgTable, varchar } from 'drizzle-orm/pg-core';

export const kitsTable = pgTable(
  'kits',
  {
    kitId: varchar('kit_id', { length: 32 }).notNull().primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    repId: varchar('rep_id', { length: 64 }).notNull(),
    data: json('data'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxKitsServerTs: index('idx_kits_server_ts').on(table.serverTs),
    idxKitsStructId: index('idx_kits_struct_id').on(table.structId),
    idxKitsRepId: index('idx_kits_rep_id').on(table.repId)
  })
);

export type KitEnt = InferSelectModel<typeof kitsTable>;
export type KitEntIns = InferInsertModel<typeof kitsTable>;
