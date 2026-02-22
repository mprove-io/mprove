import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { PartLt, PartSt } from '#common/interfaces/st-lt';

export const partsTable = pgTable(
  'parts',
  {
    partId: varchar('part_id', { length: 255 }).notNull().primaryKey(),
    messageId: varchar('message_id', { length: 255 }).notNull(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    st: json('st').$type<{ encrypted: string; decrypted: PartSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: PartLt }>().notNull(),
    keyTag: text('key_tag'),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxPartsServerTs: index('idx_parts_server_ts').on(table.serverTs),
    idxPartsMessageId: index('idx_parts_message_id').on(table.messageId),
    idxPartsSessionId: index('idx_parts_session_id').on(table.sessionId),
    idxPartsKeyTag: index('idx_parts_key_tag').on(table.keyTag),
    idxPartsCreatedTs: index('idx_parts_created_ts').on(table.createdTs)
  })
);

export type PartEnt = InferSelectModel<typeof partsTable>;
export type PartEntIns = InferInsertModel<typeof partsTable>;
