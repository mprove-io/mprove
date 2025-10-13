import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { DconfigLt, DconfigSt } from '~common/interfaces/st-lt';

export const dconfigsTable = pgTable(
  'dconfigs',
  {
    dconfigId: varchar('dconfig_id', { length: 32 }).notNull().primaryKey(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: DconfigSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: DconfigLt }>()
      .notNull(),
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
