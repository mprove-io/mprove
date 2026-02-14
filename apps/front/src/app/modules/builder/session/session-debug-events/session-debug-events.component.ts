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
    let p = event.payload as { method?: string };
    let method = p?.method || '';

    if (method === 'session/prompt') {
      return '>';
    }
    if (method === 'session/update') {
      return '<';
    }
    if (method.includes('tool')) {
      return 'T';
    }
    if (method.includes('config') || method.includes('permission')) {
      return '*';
    }
    return '.';
  }

  getMethod(event: AgentEventApi): string {
    let p = event.payload as { method?: string };
    return p?.method || '(unknown)';
  }

  getPayloadJson(event: AgentEventApi): string {
    try {
      return JSON.stringify(event.payload, undefined, 2);
    } catch {
      return String(event.payload);
    }
  }
}
