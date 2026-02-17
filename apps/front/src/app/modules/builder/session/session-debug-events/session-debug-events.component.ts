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

  getMethodIcon(event: AgentEventApi): string {
    let t = event.eventType;

    if (t === 'message.updated') {
      return '>';
    }
    if (t === 'message.part.updated') {
      return '<';
    }
    if (t.includes('permission')) {
      return '*';
    }
    if (t.startsWith('session.')) {
      return 'S';
    }
    return '.';
  }

  getMethod(event: AgentEventApi): string {
    return event.eventType;
  }

  getPayloadJson(event: AgentEventApi): string {
    try {
      return JSON.stringify(event.ocEvent, undefined, 2);
    } catch {
      return String(event.ocEvent);
    }
  }
}
