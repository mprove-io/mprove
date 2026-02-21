import { Component, Input } from '@angular/core';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';

@Component({
  standalone: false,
  selector: 'm-session-debug-events',
  templateUrl: './session-debug-events.component.html'
})
export class SessionDebugEventsComponent {
  @Input() events: AgentEventApi[] = [];

  expandedEvents: Record<string, boolean> = {};

  toggleEvent(eventId: string) {
    this.expandedEvents[eventId] = !this.expandedEvents[eventId];
  }

  getEventRole(event: AgentEventApi): string | undefined {
    if (event.ocEvent?.type === 'message.updated') {
      return event.ocEvent.properties.info.role;
    }
    return undefined;
  }

  getPayloadJson(event: AgentEventApi): string {
    try {
      return JSON.stringify(event.ocEvent, undefined, 2);
    } catch {
      return String(event.ocEvent);
    }
  }
}
