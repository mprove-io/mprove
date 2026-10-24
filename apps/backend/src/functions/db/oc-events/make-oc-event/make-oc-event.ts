import type { OcEventTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeOcEventFullId } from '#backend/functions/db/oc-events/make-oc-event/make-oc-event-full-id/make-oc-event-full-id';
import type { SessionStreamEvent } from '#common/types/backend/parts/session/session-stream-event';

export function makeOcEvent(item: {
  sessionId: string;
  event: SessionStreamEvent;
  eventIndex: number;
}): OcEventTab {
  let now: number = Date.now();

  let eventTab: OcEventTab = {
    eventId: makeOcEventFullId({
      sessionId: item.sessionId,
      eventIndex: item.eventIndex
    }),
    sessionId: item.sessionId,
    eventIndex: item.eventIndex,
    type: item.event.type,
    ocEvent: item.event,
    createdTs: now,
    serverTs: undefined,
    keyTag: undefined
  };

  return eventTab;
}
