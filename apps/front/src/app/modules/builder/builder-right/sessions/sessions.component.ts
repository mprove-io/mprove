import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { PROD_REPO_ID } from '#common/constants/top';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { SessionApi } from '#common/interfaces/backend/session-api';
import {
  ToBackendArchiveAgentSessionRequestPayload,
  ToBackendArchiveAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-archive-agent-session';
import {
  ToBackendGetAgentSessionsListRequestPayload,
  ToBackendGetAgentSessionsListResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-sessions-list';
import {
  ToBackendPauseAgentSessionRequestPayload,
  ToBackendPauseAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-pause-agent-session';
import { makeTitle } from '#front/app/functions/make-title';
import { NavQuery } from '#front/app/queries/nav.query';
import { RepoQuery } from '#front/app/queries/repo.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

let SESSIONS_SPINNER_NAME = 'sessionsRefresh';

export class SessionApiX extends SessionApi {
  displayTitle: string;
  providerLabel: string;
}

@Component({
  standalone: false,
  selector: 'm-sessions',
  templateUrl: './sessions.component.html'
})
export class SessionsComponent implements OnInit {
  sessions: SessionApiX[] = [];
  sessionsLoaded = false;
  hasMoreArchived = false;
  isLoadingArchived = false;
  archivedLastCreatedTs: number = undefined;
  currentSession: SessionApi;
  isRefreshing = false;
  sessionStatusArchived = SessionStatusEnum.Archived;
  spinnerName = SESSIONS_SPINNER_NAME;
  debugMode = false;
  isShowDebugToggle = false;
  allEventsExpanded = false;
  providerLabels: Record<string, string> = {
    opencode: 'Zen',
    openai: 'OpenAI',
    anthropic: 'Anthropic'
  };

  sessions$ = this.sessionsQuery.sessions$.pipe(
    tap(x => {
      this.sessions = x
        .map(s =>
          Object.assign({}, s, <SessionApiX>{
            displayTitle: makeTitle(s),
            providerLabel: this.providerLabels[s.provider] || s.provider
          })
        )
        .sort((a, b) => {
          let aArchived = a.status === SessionStatusEnum.Archived ? 1 : 0;
          let bArchived = b.status === SessionStatusEnum.Archived ? 1 : 0;
          return aArchived - bArchived || b.createdTs - a.createdTs;
        });
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

  hasMoreArchived$ = this.sessionsQuery.hasMoreArchived$.pipe(
    tap(x => {
      this.hasMoreArchived = x;
      this.cd.detectChanges();
    })
  );

  session$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.currentSession = x;
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
    private spinner: NgxSpinnerService,
    private myDialogService: MyDialogService,
    private sessionBundleQuery: SessionBundleQuery,
    private repoQuery: RepoQuery
  ) {}

  ngOnInit() {
    let isListLoaded = this.sessionsQuery.getValue().isListLoaded;
    if (!isListLoaded) {
      this.loadSessions();
    } else {
      this.sessionsLoaded = true;
    }
  }

  loadSessions() {
    let projectId: string;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let currentSessionId =
      this.currentSession?.sessionId ?? this.sessionQuery.getValue()?.sessionId;

    let payload: ToBackendGetAgentSessionsListRequestPayload = {
      projectId: projectId,
      currentSessionId: currentSessionId
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

            if (currentSessionId) {
              let freshCurrentSession = sessions.find(
                s => s.sessionId === currentSessionId
              );
              if (freshCurrentSession) {
                this.sessionQuery.update(freshCurrentSession);
              }
            }

            let hasMoreArchived = resp.payload.hasMoreArchived ?? false;

            this.sessionsQuery.updatePart({
              sessions: sessions,
              isListLoaded: true,
              hasMoreArchived: hasMoreArchived
            });
          }

          this.isRefreshing = false;
          this.spinner.hide(SESSIONS_SPINNER_NAME);
          this.sessionsLoaded = true;
          this.archivedLastCreatedTs = undefined;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  newSession() {
    if (!this.currentSession?.sessionId) {
      return;
    }

    this.uiQuery.updatePart({ showContent: false });
    this.sessionBundleQuery.reset();
    this.sessionEventsQuery.reset();

    let session = this.sessionQuery.getValue();
    this.sessionQuery.update({ ...session, firstMessage: undefined });
    this.repoQuery.updatePart({
      repoStatus: RepoStatusEnum.Ok, // for "Push to Remote" not flash during navigation
      changesToCommit: [],
      changesToPush: []
    });

    this.navigateService.navigateToBuilder({
      repoId: PROD_REPO_ID,
      branchId: this.navQuery.getValue().projectDefaultBranch
    });
  }

  pauseSession(event: MouseEvent, session: SessionApiX) {
    event.stopPropagation();

    let sessionId = session.sessionId;

    let payload: ToBackendPauseAgentSessionRequestPayload = {
      sessionId: sessionId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendPauseAgentSession,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        map((resp: ToBackendPauseAgentSessionResponse) => {
          let respSession = resp.payload.session;

          if (respSession.status === 'Archived') {
            this.updatedArchivedSessions({
              session: session,
              respSession: respSession
            });
          } else {
            let sessions = this.sessionsQuery.getValue().sessions;
            let updated = sessions.map(s =>
              s.sessionId === sessionId
                ? {
                    ...s,
                    status: respSession.status,
                    archiveReason: respSession.archiveReason,
                    pauseReason: respSession.pauseReason
                  }
                : s
            );
            this.sessionsQuery.updatePart({ sessions: updated });

            let currentSession = this.sessionQuery.getValue();

            if (currentSession?.sessionId === sessionId) {
              this.sessionQuery.update({
                ...currentSession,
                status: respSession.status,
                archiveReason: respSession.archiveReason,
                pauseReason: respSession.pauseReason
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  archiveSession(event: MouseEvent, session: SessionApiX) {
    event.stopPropagation();

    let sessionId = session.sessionId;

    let payload: ToBackendArchiveAgentSessionRequestPayload = {
      sessionId: sessionId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendArchiveAgentSession,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        map((resp: ToBackendArchiveAgentSessionResponse) => {
          let respSession = resp.payload.session;

          this.updatedArchivedSessions({
            session: session,
            respSession: respSession
          });
        }),
        take(1)
      )
      .subscribe();
  }

  private updatedArchivedSessions(item: {
    session: SessionApiX;
    respSession: SessionApi;
  }) {
    let { session, respSession } = item;
    let sessionId = session.sessionId;

    let sessions = this.sessionsQuery.getValue().sessions;

    if (
      this.archivedLastCreatedTs !== undefined &&
      session.createdTs >= this.archivedLastCreatedTs
    ) {
      // Move to archived section
      let others = sessions.filter(s => s.sessionId !== sessionId);
      let nonArchived = others.filter(s => s.status !== 'Archived');
      let archived = others.filter(s => s.status === 'Archived');
      let archivedSession = {
        ...session,
        status: respSession.status,
        archiveReason: respSession.archiveReason,
        pauseReason: respSession.pauseReason
      };

      let insertIdx = archived.findIndex(
        s => s.createdTs < archivedSession.createdTs
      );
      if (insertIdx === -1) {
        archived.push(archivedSession);
      } else {
        archived.splice(insertIdx, 0, archivedSession);
      }

      this.sessionsQuery.updatePart({
        sessions: [...nonArchived, ...archived],
        hasMoreArchived: true
      });
    } else {
      // Remove from list
      let updated = sessions.filter(s => s.sessionId !== sessionId);
      this.sessionsQuery.updatePart({
        sessions: updated,
        hasMoreArchived: true
      });
    }

    this.cd.detectChanges();

    let currentSession = this.sessionQuery.getValue();
    if (currentSession?.sessionId === sessionId) {
      this.navigateService.navigateToBuilder();
    }
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
      archivedLastCreatedTs: this.archivedLastCreatedTs,
      currentSessionId: this.currentSession?.sessionId
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
            let sessions = resp.payload.sessions;

            if (this.currentSession?.sessionId) {
              let freshCurrentSession = sessions.find(
                s => s.sessionId === this.currentSession?.sessionId
              );
              if (freshCurrentSession) {
                this.sessionQuery.update(freshCurrentSession);
              }
            }

            let hasMoreArchived = resp.payload.hasMoreArchived ?? false;

            this.sessionsQuery.updatePart({
              sessions: sessions,
              hasMoreArchived: hasMoreArchived
            });
            let archivedSessions = resp.payload.sessions.filter(
              s =>
                s.status === SessionStatusEnum.Archived &&
                s.sessionId !== this.currentSession?.sessionId
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

  renameSession(event: MouseEvent, session: SessionApiX) {
    event.stopPropagation();
    this.myDialogService.showEditSessionTitle({
      apiService: this.apiService,
      sessionId: session.sessionId,
      title: makeTitle(session)
    });
  }

  deleteSession(event: MouseEvent, session: SessionApiX) {
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

  trackBySessionId(_index: number, session: SessionApiX) {
    return session.sessionId;
  }

  openSession(session: SessionApi) {
    if (session.sessionId === this.currentSession?.sessionId) {
      return;
    }

    this.uiQuery.updatePart({ showContent: false });
    this.sessionBundleQuery.reset();
    this.sessionEventsQuery.reset();
    this.sessionQuery.update({ ...session, firstMessage: undefined });
    this.navigateService.navigateToSession({
      sessionId: session.sessionId,
      repoId: session.repoId,
      branchId: session.branchId
    });
  }
}
