import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { SessionEventApi } from '#common/interfaces/backend/session-event-api';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { UiQuery } from '#front/app/queries/ui.query';

@Component({
  standalone: false,
  selector: 'm-debug-events-panel',
  templateUrl: './debug-events-panel.component.html'
})
export class DebugEventsPanelComponent {
  liveEvents: SessionEventApi[] = [];
  liveEvents$ = this.sessionEventsQuery.liveEvents$.pipe(
    tap(x => {
      this.liveEvents = x;
      this.cd.detectChanges();
    })
  );

  allEventsExpanded = false;
  allEventsExpanded$ = this.uiQuery.sessionAllEventsExpanded$.pipe(
    tap(x => {
      this.allEventsExpanded = x;
      this.cd.detectChanges();
    })
  );

  copied = false;

  debugExpandedEvents: Record<string, boolean> = {};
  toggleAllEventsLastValue = 0;
  toggleAllEvents$ = this.uiQuery.sessionToggleAllEvents$.pipe(
    tap(x => {
      if (x !== this.toggleAllEventsLastValue) {
        this.toggleAllEventsLastValue = x;
        this.allEventsExpanded = !this.allEventsExpanded;
        let expanded: Record<string, boolean> = {};
        if (this.allEventsExpanded) {
          this.liveEvents.forEach(event => {
            expanded[event.eventId] = true;
          });
        }
        this.debugExpandedEvents = expanded;
        this.uiQuery.updatePart({
          sessionAllEventsExpanded: this.allEventsExpanded
        });
        this.cd.detectChanges();
      }
    })
  );

  constructor(
    private sessionEventsQuery: SessionEventsQuery,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}

  copyEventsJson() {
    let state = this.sessionEventsQuery.getValue();
    let events = state.liveEvents;
    let json = JSON.stringify(events, undefined, 2);
    navigator.clipboard.writeText(json).then(() => {
      this.copied = true;
      this.cd.detectChanges();
    });
  }

  toggleAllEvents() {
    let newValue = this.uiQuery.getValue().sessionToggleAllEvents + 1;
    this.uiQuery.updatePart({ sessionToggleAllEvents: newValue });
  }
}
