import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const dconfigsTable = pgTable(
  'dconfigs',
  {
    dconfigId: varchar('dconfig_id', { length: 32 }).notNull().primaryKey(),
    st: text('st'),
    lt: text('lt'),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxDconfigsServerTs: index('idx_dconfigs_server_ts').on(table.serverTs),
    idxDconfigsKeyTag: index('idx_dconfigs_key_tag').on(table.keyTag)
  })
);

export type DconfigEnt = InferSelectModel<typeof dconfigsTable>;
export type DconfigEntIns = InferInsertModel<typeof dconfigsTable>;
