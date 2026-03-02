import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { OcPartLt, OcPartSt } from '#common/interfaces/st-lt';

export const ocPartsTable = pgTable(
  'oc_parts',
  {
    partId: varchar('part_id', { length: 255 }).notNull().primaryKey(),
    messageId: varchar('message_id', { length: 255 }).notNull(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: OcPartSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: OcPartLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxOcPartsServerTs: index('idx_oc_parts_server_ts').on(table.serverTs),
    idxOcPartsMessageId: index('idx_oc_parts_message_id').on(table.messageId),
    idxOcPartsSessionId: index('idx_oc_parts_session_id').on(table.sessionId),
    idxOcPartsKeyTag: index('idx_oc_parts_key_tag').on(table.keyTag),
    idxOcPartsCreatedTs: index('idx_oc_parts_created_ts').on(table.createdTs)
  })
);

export type OcPartEnt = InferSelectModel<typeof ocPartsTable>;
export type OcPartEntIns = InferInsertModel<typeof ocPartsTable>;
