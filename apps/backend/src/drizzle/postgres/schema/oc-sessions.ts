import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { OcSessionLt, OcSessionSt } from '#common/interfaces/st-lt';

export const ocSessionsTable = pgTable(
  'oc_sessions',
  {
    sessionId: varchar('session_id', { length: 255 }).notNull().primaryKey(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: OcSessionSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: OcSessionLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxOcSessionsServerTs: index('idx_oc_sessions_server_ts').on(
      table.serverTs
    ),
    idxOcSessionsKeyTag: index('idx_oc_sessions_key_tag').on(table.keyTag)
  })
);

export type OcSessionEnt = InferSelectModel<typeof ocSessionsTable>;

export type OcSessionEntIns = InferInsertModel<typeof ocSessionsTable>;
