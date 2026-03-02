import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { OcEventLt, OcEventSt } from '#common/interfaces/st-lt';

export const ocEventsTable = pgTable(
  'oc_events',
  {
    eventId: varchar('event_id', { length: 255 }).notNull().primaryKey(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    eventIndex: bigint('event_index', { mode: 'number' }).notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: OcEventSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: OcEventLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxOcEventsServerTs: index('idx_oc_events_server_ts').on(table.serverTs),
    idxOcEventsCreatedTs: index('idx_oc_events_created_ts').on(table.createdTs),
    idxOcEventsEventId: index('idx_oc_events_event_id').on(table.eventId),
    idxOcEventsSessionId: index('idx_oc_events_session_id').on(table.sessionId),
    idxOcEventsKeyTag: index('idx_oc_events_key_tag').on(table.keyTag)
  })
);

export type OcEventEnt = InferSelectModel<typeof ocEventsTable>;
export type OcEventEntIns = InferInsertModel<typeof ocEventsTable>;
