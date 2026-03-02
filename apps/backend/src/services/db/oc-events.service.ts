import { Injectable } from '@nestjs/common';
import type { Event } from '@opencode-ai/sdk/v2';
import type { OcEventTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class OcEventsService {
  makeOcEventFullId(item: { sessionId: string; eventIndex: number }): string {
    return `${item.sessionId}_${item.eventIndex}`;
  }

  makeOcEvent(item: {
    sessionId: string;
    event: Event;
    eventIndex: number;
  }): OcEventTab {
    let now = Date.now();

    let eventTab: OcEventTab = {
      eventId: this.makeOcEventFullId({
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
