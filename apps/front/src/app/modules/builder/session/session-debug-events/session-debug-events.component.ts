import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { SessionEventApi } from '#common/interfaces/backend/session-event-api';

@Component({
  standalone: false,
  selector: 'm-session-debug-events',
  templateUrl: './session-debug-events.component.html'
})
export class SessionDebugEventsComponent implements OnChanges {
  @Input() events: SessionEventApi[] = [];

  reversedEvents: SessionEventApi[] = [];

  ngOnChanges() {
    this.reversedEvents = [...this.events].reverse();
  }

  @Input() expandedEvents: Record<string, boolean> = {};
  @Output() expandedEventsChange = new EventEmitter<Record<string, boolean>>();

  toggleEvent(eventId: string) {
    this.expandedEvents = {
      ...this.expandedEvents,
      [eventId]: !this.expandedEvents[eventId]
    };
    this.expandedEventsChange.emit(this.expandedEvents);
  }

  getEventRole(event: SessionEventApi): string | undefined {
    if (event.ocEvent?.type === 'message.updated') {
      return event.ocEvent.properties.info.role;
    }
    return undefined;
  }

  getPartType(event: SessionEventApi): string | undefined {
    let ocEvent = event.ocEvent as any;
    return ocEvent?.properties?.part?.type;
  }

  getPartTool(event: SessionEventApi): string | undefined {
    let ocEvent = event.ocEvent as any;
    return ocEvent?.properties?.part?.tool;
  }

  getPayloadJson(event: SessionEventApi): string {
    try {
      return JSON.stringify(event.ocEvent, undefined, 2);
    } catch {
      return String(event.ocEvent);
    }
  }
}
