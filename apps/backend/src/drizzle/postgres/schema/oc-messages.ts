import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { OcMessageLt, OcMessageSt } from '#common/interfaces/st-lt';

export const ocMessagesTable = pgTable(
  'oc_messages',
  {
    messageId: varchar('message_id', { length: 255 }).notNull().primaryKey(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    role: varchar('role', { length: 32 }).notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: OcMessageSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: OcMessageLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxOcMessagesServerTs: index('idx_oc_messages_server_ts').on(
      table.serverTs
    ),
    idxOcMessagesSessionId: index('idx_oc_messages_session_id').on(
      table.sessionId
    ),
    idxOcMessagesKeyTag: index('idx_oc_messages_key_tag').on(table.keyTag),
    idxOcMessagesCreatedTs: index('idx_oc_messages_created_ts').on(
      table.createdTs
    )
  })
);

export type OcMessageEnt = InferSelectModel<typeof ocMessagesTable>;
export type OcMessageEntIns = InferInsertModel<typeof ocMessagesTable>;
