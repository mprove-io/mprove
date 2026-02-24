import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import {
  ToBackendGetAgentSessionsListRequestPayload,
  ToBackendGetAgentSessionsListResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-sessions-list';
import { makeTitle } from '#front/app/functions/make-title';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

let SESSIONS_SPINNER_NAME = 'sessionsRefresh';

export class AgentSessionApiX extends AgentSessionApi {
  displayTitle: string;
  providerLabel: string;
}

@Component({
  standalone: false,
  selector: 'm-sessions',
  templateUrl: './sessions.component.html'
})
export class SessionsComponent implements OnInit {
  sessions: AgentSessionApiX[] = [];
  hasMoreArchived = false;
  isLoadingArchived = false;
  archivedLastCreatedTs: number = undefined;
  sessionId: string;
  isRefreshing = false;
  spinnerName = SESSIONS_SPINNER_NAME;
  debugMode = false;
  allEventsExpanded = false;
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
          providerLabel: this.providerLabels[s.provider] || s.provider
        })
      );
      this.cd.detectChanges();
    })
  );

  debugMode$ = this.uiQuery.sessionDebugMode$.pipe(
    tap(x => {
      this.debugMode = x;
      this.cd.detectChanges();
    })
  );

  allEventsExpanded$ = this.uiQuery.sessionAllEventsExpanded$.pipe(
    tap(x => {
      this.allEventsExpanded = x;
      this.cd.detectChanges();
    })
  );

  session$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.sessionId = x?.sessionId;
      this.cd.detectChanges();
    })
  );

  constructor(
    private sessionsQuery: SessionsQuery,
    private sessionQuery: SessionQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private uiService: UiService,
    private spinner: NgxSpinnerService,
    private myDialogService: MyDialogService
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
            let sessions = resp.payload.sessions;

            // Keep the currently selected session visible even if archived
            if (this.sessionId) {
              let found = sessions.some(s => s.sessionId === this.sessionId);
              if (!found) {
                let currentSession = this.sessionQuery.getValue();
                if (currentSession) {
                  sessions = [...sessions, currentSession];
                }
              }
            }

            this.sessionsQuery.update({
              sessions: sessions
            });
          }

          this.isRefreshing = false;
          this.spinner.hide(SESSIONS_SPINNER_NAME);
          this.hasMoreArchived = false;
          this.archivedLastCreatedTs = undefined;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  newSession() {
    this.navigateService.navigateToBuilder();
  }

  pauseSession(event: MouseEvent, session: AgentSessionApiX) {
    event.stopPropagation();

    let sessionId = session.sessionId;

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendPauseAgentSession,
        payload: { sessionId: sessionId },
        showSpinner: true
      })
      .pipe(
        tap(() => {
          let sessions = this.sessionsQuery.getValue().sessions;
          let updated = sessions.map(s =>
            s.sessionId === sessionId
              ? { ...s, status: SessionStatusEnum.Paused }
              : s
          );
          this.sessionsQuery.updatePart({ sessions: updated });

          let currentSession = this.sessionQuery.getValue();
          if (currentSession?.sessionId === sessionId) {
            this.sessionQuery.update({
              ...currentSession,
              status: SessionStatusEnum.Paused
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  archiveSession(event: MouseEvent, session: AgentSessionApiX) {
    event.stopPropagation();

    let sessionId = session.sessionId;

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendArchiveAgentSession,
        payload: { sessionId: sessionId },
        showSpinner: true
      })
      .pipe(
        tap(() => {
          let sessions = this.sessionsQuery.getValue().sessions;

          if (
            this.archivedLastCreatedTs !== undefined &&
            session.createdTs >= this.archivedLastCreatedTs
          ) {
            // Move to archived section
            let others = sessions.filter(s => s.sessionId !== sessionId);
            let nonArchived = others.filter(s => s.status !== 'Archived');
            let archived = others.filter(s => s.status === 'Archived');
            let archivedSession = { ...session, status: 'Archived' };

            let insertIdx = archived.findIndex(
              s => s.createdTs < archivedSession.createdTs
            );
            if (insertIdx === -1) {
              archived.push(archivedSession);
            } else {
              archived.splice(insertIdx, 0, archivedSession);
            }

            this.sessionsQuery.updatePart({
              sessions: [...nonArchived, ...archived]
            });
          } else {
            // Remove from list
            let updated = sessions.filter(s => s.sessionId !== sessionId);
            this.sessionsQuery.updatePart({ sessions: updated });
          }

          let currentSession = this.sessionQuery.getValue();
          if (currentSession?.sessionId === sessionId) {
            this.navigateService.navigateToBuilder();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  loadArchivedSessions() {
    let projectId: string;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: ToBackendGetAgentSessionsListRequestPayload = {
      projectId: projectId,
      includeArchived: true,
      archivedLimit: 10,
      archivedLastCreatedTs: this.archivedLastCreatedTs
    };

    this.isLoadingArchived = true;
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
            this.hasMoreArchived = resp.payload.hasMoreArchived ?? false;
            let archivedSessions = resp.payload.sessions.filter(
              s => s.status === 'Archived'
            );
            if (archivedSessions.length > 0) {
              this.archivedLastCreatedTs =
                archivedSessions[archivedSessions.length - 1].createdTs;
            }
          }

          this.isLoadingArchived = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  renameSession(event: MouseEvent, session: AgentSessionApiX) {
    event.stopPropagation();
    this.myDialogService.showEditSessionTitle({
      apiService: this.apiService,
      sessionId: session.sessionId,
      title: makeTitle(session)
    });
  }

  deleteSession(event: MouseEvent, session: AgentSessionApiX) {
    event.stopPropagation();
    this.myDialogService.showDeleteSession({
      apiService: this.apiService,
      sessionId: session.sessionId,
      title: makeTitle(session)
    });
  }

  toggleDebug() {
    this.uiQuery.updatePart({ sessionDebugMode: !this.debugMode });
  }

  copyEventsJson() {
    let events = this.sessionEventsQuery.getValue().events;
    let json = JSON.stringify(events, undefined, 2);
    navigator.clipboard.writeText(json);
  }

  toggleAllEvents() {
    let newValue = this.uiQuery.getValue().sessionToggleAllEvents + 1;
    this.uiQuery.updatePart({ sessionToggleAllEvents: newValue });
  }

  trackBySessionId(_index: number, session: AgentSessionApiX) {
    return session.sessionId;
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
