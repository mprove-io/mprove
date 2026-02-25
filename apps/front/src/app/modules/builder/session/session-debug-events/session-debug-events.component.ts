import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';

@Component({
  standalone: false,
  selector: 'm-session-debug-events',
  templateUrl: './session-debug-events.component.html'
})
export class SessionDebugEventsComponent {
  @Input() events: AgentEventApi[] = [];
  @Input() expandedEvents: Record<string, boolean> = {};
  @Output() expandedEventsChange = new EventEmitter<Record<string, boolean>>();

  toggleEvent(eventId: string) {
    this.expandedEvents = {
      ...this.expandedEvents,
      [eventId]: !this.expandedEvents[eventId]
    };
    this.expandedEventsChange.emit(this.expandedEvents);
  }

  getEventRole(event: AgentEventApi): string | undefined {
    if (event.ocEvent?.type === 'message.updated') {
      return event.ocEvent.properties.info.role;
    }
    return undefined;
  }

  getPartType(event: AgentEventApi): string | undefined {
    let ocEvent = event.ocEvent as any;
    return ocEvent?.properties?.part?.type;
  }

  getPartTool(event: AgentEventApi): string | undefined {
    let ocEvent = event.ocEvent as any;
    return ocEvent?.properties?.part?.tool;
  }

  getPayloadJson(event: AgentEventApi): string {
    try {
      return JSON.stringify(event.ocEvent, undefined, 2);
    } catch {
      return String(event.ocEvent);
    }
  }
}
