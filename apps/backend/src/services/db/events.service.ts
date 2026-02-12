import { Injectable } from '@nestjs/common';
import type { SessionEvent } from 'sandbox-agent';
import type { EventTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class EventsService {
  makeEventFullId(item: { sessionId: string; eventId: string }): string {
    return `${item.sessionId}_${item.eventId}`;
  }

  makeEvent(item: { sessionId: string; event: SessionEvent }): EventTab {
    let now = Date.now();

    let eventTab: EventTab = {
      eventId: this.makeEventFullId({
        sessionId: item.sessionId,
        eventId: item.event.id
      }),
      sessionId: item.sessionId,
      eventIndex: item.event.eventIndex,
      sender: item.event.sender,
      universalEvent: item.event,
      createdTs: now,
      serverTs: undefined,
      keyTag: undefined
    };

    return eventTab;
  }
}
