import { Injectable } from '@nestjs/common';
import type { Event } from '@opencode-ai/sdk/v2';
import type { EventTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class EventsService {
  makeEventFullId(item: { sessionId: string; eventIndex: number }): string {
    return `${item.sessionId}_${item.eventIndex}`;
  }

  makeEvent(item: {
    sessionId: string;
    event: Event;
    eventIndex: number;
  }): EventTab {
    let now = Date.now();

    let eventTab: EventTab = {
      eventId: this.makeEventFullId({
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
}
