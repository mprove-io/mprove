import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { EventLt, EventSt } from '#common/interfaces/st-lt';

export const eventsTable = pgTable(
  'events',
  {
    eventId: varchar('event_id', { length: 255 }).notNull().primaryKey(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    sequence: bigint('sequence', { mode: 'number' }).notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    st: json('st').$type<{ encrypted: string; decrypted: EventSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: EventLt }>().notNull(),
    keyTag: text('key_tag'),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxEventsServerTs: index('idx_events_server_ts').on(table.serverTs),
    idxEventsCreatedTs: index('idx_events_created_ts').on(table.createdTs),
    idxEventsEventId: index('idx_events_event_id').on(table.eventId),
    idxEventsSessionId: index('idx_events_session_id').on(table.sessionId),
    idxEventsKeyTag: index('idx_events_key_tag').on(table.keyTag)
  })
);

export type EventEnt = InferSelectModel<typeof eventsTable>;
export type EventEntIns = InferInsertModel<typeof eventsTable>;
