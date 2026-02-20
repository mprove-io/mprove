import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { MessageLt, MessageSt } from '#common/interfaces/st-lt';

export const messagesTable = pgTable(
  'messages',
  {
    messageId: varchar('message_id', { length: 255 }).notNull().primaryKey(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    role: varchar('role', { length: 32 }).notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: MessageSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: MessageLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxMessagesServerTs: index('idx_messages_server_ts').on(table.serverTs),
    idxMessagesSessionId: index('idx_messages_session_id').on(table.sessionId),
    idxMessagesKeyTag: index('idx_messages_key_tag').on(table.keyTag),
    idxMessagesCreatedTs: index('idx_messages_created_ts').on(table.createdTs)
  })
);

export type MessageEnt = InferSelectModel<typeof messagesTable>;
export type MessageEntIns = InferInsertModel<typeof messagesTable>;
