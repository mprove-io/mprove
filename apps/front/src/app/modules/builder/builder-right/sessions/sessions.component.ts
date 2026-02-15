import { ChangeDetectorRef, Component } from '@angular/core';
import { interval } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { TimeService } from '#front/app/services/time.service';

@Component({
  standalone: false,
  selector: 'm-sessions',
  templateUrl: './sessions.component.html'
})
export class SessionsComponent {
  sessions: AgentSessionApi[] = [];
  sessionId: string;
  lastActivityTimes: Record<string, string> = {};

  sessions$ = this.sessionsQuery.sessions$.pipe(
    tap(x => {
      this.sessions = x;
      this.cd.detectChanges();
    })
  );

  session$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.sessionId = x?.sessionId;
      this.cd.detectChanges();
    })
  );

  interval$ = interval(1000).pipe(
    startWith(0),
    tap(x => {
      this.calculateTimes();
      this.cd.detectChanges();
    })
  );

  constructor(
    private sessionsQuery: SessionsQuery,
    private sessionQuery: SessionQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private timeService: TimeService
  ) {}

  newSession() {
    this.navigateService.navigateToBuilder();
  }

  openSession(session: AgentSessionApi) {
    if (this.sessionId) {
      this.uiQuery.updatePart({ isNavigatingSession: true });
    }
    this.sessionQuery.update(session);
    this.navigateService.navigateToSession({
      sessionId: session.sessionId
    });
  }

  calculateTimes() {
    for (let session of this.sessions) {
      this.lastActivityTimes[session.sessionId] = session.lastActivityTs
        ? this.timeService.timeAgoFromNow(session.lastActivityTs)
        : '';
    }
  }
}
