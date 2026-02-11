import { Injectable } from '@nestjs/common';
import type { UniversalEvent } from 'sandbox-agent';
import type { EventTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class EventsService {
  makeEventFullId(item: { sessionId: string; eventId: string }): string {
    return `${item.sessionId}_${item.eventId}`;
  }

  makeEvent(item: { sessionId: string; event: UniversalEvent }): EventTab {
    let now = Date.now();

    let eventTab: EventTab = {
      eventId: this.makeEventFullId({
        sessionId: item.sessionId,
        eventId: item.event.event_id
      }),
      sessionId: item.sessionId,
      sequence: item.event.sequence,
      type: item.event.type,
      universalEvent: item.event,
      createdTs: now,
      serverTs: undefined,
      keyTag: undefined
    };

    return eventTab;
  }
}
