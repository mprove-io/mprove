import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval } from 'rxjs';
import { map, startWith, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import {
  ToBackendGetAgentSessionsListRequestPayload,
  ToBackendGetAgentSessionsListResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-sessions-list';
import { makeTitle } from '#front/app/functions/make-title';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { TimeService } from '#front/app/services/time.service';
import { UiService } from '#front/app/services/ui.service';

let SESSIONS_SPINNER_NAME = 'sessionsRefresh';

export class AgentSessionApiX extends AgentSessionApi {
  displayTitle: string;
  timeAgo: string;
  providerLabel: string;
}

@Component({
  standalone: false,
  selector: 'm-sessions',
  templateUrl: './sessions.component.html'
})
export class SessionsComponent implements OnInit {
  sessions: AgentSessionApiX[] = [];
  sessionId: string;
  isRefreshing = false;
  spinnerName = SESSIONS_SPINNER_NAME;
  providerLabels: Record<string, string> = {
    opencode: 'Zen',
    openai: 'OpenAI',
    anthropic: 'Anthropic'
  };

  sessions$ = this.sessionsQuery.sessions$.pipe(
    tap(x => {
      this.sessions = x.map(s =>
        Object.assign({}, s, <AgentSessionApiX>{
          displayTitle: makeTitle(s),
          timeAgo: s.lastActivityTs
            ? this.timeService.timeAgoFromNow(s.lastActivityTs)
            : '',
          providerLabel: this.providerLabels[s.provider] || s.provider
        })
      );
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
    tap(() => {
      this.sessions = this.sessions.map(s =>
        Object.assign({}, s, {
          timeAgo: s.lastActivityTs
            ? this.timeService.timeAgoFromNow(s.lastActivityTs)
            : ''
        })
      );
      this.cd.detectChanges();
    })
  );

  constructor(
    private sessionsQuery: SessionsQuery,
    private sessionQuery: SessionQuery,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private timeService: TimeService,
    private uiService: UiService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    let projectId: string;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: ToBackendGetAgentSessionsListRequestPayload = {
      projectId: projectId
    };

    this.isRefreshing = true;
    this.spinner.show(SESSIONS_SPINNER_NAME);
    this.cd.detectChanges();

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetAgentSessionsList,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetAgentSessionsListResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.sessionsQuery.update({
              sessions: resp.payload.sessions
            });
          }

          this.isRefreshing = false;
          this.spinner.hide(SESSIONS_SPINNER_NAME);
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  newSession() {
    this.navigateService.navigateToBuilder();
  }

  openSession(session: AgentSessionApi) {
    if (this.sessionId) {
      this.uiQuery.updatePart({ showSessionMessages: false });
    }
    this.sessionQuery.update(session);
    this.navigateService.navigateToSession({
      sessionId: session.sessionId
    });
    this.uiService.setProjectSessionLink({
      sessionId: session.sessionId
    });
  }
}
