import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { SessionApi } from '#common/zod/backend/session-api';
import type { SessionApiX } from '#common/zod/front/session-api-x';
import type {
  ToBackendGetSessionsListRequestPayload,
  ToBackendGetSessionsListResponse
} from '#common/zod/to-backend/sessions/to-backend-get-sessions-list';
import { makeTitle } from '#front/app/functions/make-title';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

let EXPLORER_HISTORY_SPINNER_NAME = 'explorerHistoryRefresh';

@Component({
  standalone: false,
  selector: 'm-explorer-history',
  templateUrl: './explorer-history.component.html',
  styleUrl: './explorer-history.component.scss'
})
export class ExplorerHistoryComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  sessions: SessionApiX[] = [];
  sessionsLoaded = false;
  isRefreshing = false;
  currentSession: SessionApi;
  spinnerName = EXPLORER_HISTORY_SPINNER_NAME;

  sessions$ = this.sessionsQuery.sessions$.pipe(
    tap(x => {
      this.sessions = x
        .filter(s => s.type === SessionTypeEnum.Explorer)
        .map(s =>
          Object.assign({}, s, <SessionApiX>{ displayTitle: makeTitle(s) })
        )
        .sort((a, b) => b.createdTs - a.createdTs);

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
    private navQuery: NavQuery,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
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

    let currentSessionId =
      this.currentSession?.sessionId ?? this.sessionQuery.getValue()?.sessionId;

    let payload: ToBackendGetSessionsListRequestPayload = {
      projectId: projectId,
      currentSessionId: currentSessionId,
      sessionType: SessionTypeEnum.Explorer
    };

    this.isRefreshing = true;

    this.spinner.show(EXPLORER_HISTORY_SPINNER_NAME);

    this.cd.detectChanges();

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetSessionsList,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetSessionsListResponse) => {
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

            this.sessionsQuery.updatePart({
              sessions: sessions,
              isListLoaded: true,
              hasMoreArchived: resp.payload.hasMoreArchived ?? false
            });
          }

          this.isRefreshing = false;

          this.spinner.hide(EXPLORER_HISTORY_SPINNER_NAME);

          this.sessionsLoaded = true;

          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  async openSession(session: SessionApi) {
    await this.navigateService.navigateToExplorerSession({
      sessionId: session.sessionId,
      repoId: session.repoId,
      branchId: session.branchId,
      envId: session.envId
    });

    this.close.emit();
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

  trackBySessionId(_index: number, session: SessionApiX) {
    return session.sessionId;
  }

  closeOverlay() {
    this.close.emit();
  }
}
