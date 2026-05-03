import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import {
  BRANCH_MAIN,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { SessionApi } from '#common/zod/backend/session-api';
import type { SessionApiX } from '#common/zod/front/session-api-x';
import type {
  ToBackendGetSessionsListRequestPayload,
  ToBackendGetSessionsListResponse
} from '#common/zod/to-backend/sessions/to-backend-get-sessions-list';
import { makeBranchExtraName } from '#front/app/functions/make-branch-extra-name';
import { makeTitle } from '#front/app/functions/make-title';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

type HistorySessionGroup = {
  title: string;
  sessions: SessionApiX[];
};

let ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
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
  sessionGroups: HistorySessionGroup[] = [];
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
      this.sessionGroups = this.groupSessions({ sessions: this.sessions });

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
    private userQuery: UserQuery,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  showSessionEnvRepoBranch(item: { session: SessionApiX }) {
    return (
      item.session.envId !== PROJECT_ENV_PROD ||
      item.session.repoId !== PROD_REPO_ID ||
      item.session.branchId !== BRANCH_MAIN
    );
  }

  makeSessionRepoBranchName(item: { session: SessionApiX }) {
    let user = this.userQuery.getValue();
    let repoType =
      item.session.repoId === PROD_REPO_ID
        ? RepoTypeEnum.Production
        : item.session.repoId === user.userId
          ? RepoTypeEnum.Dev
          : RepoTypeEnum.Session;

    return makeBranchExtraName({
      repoType: repoType,
      branchId: item.session.branchId,
      alias: user.alias
    });
  }

  groupSessions(item: { sessions: SessionApiX[] }) {
    let now = Date.now();
    let groups: HistorySessionGroup[] = [];

    item.sessions.forEach(session => {
      let title = this.makeGroupTitle({
        createdTs: session.createdTs,
        now: now
      });
      let group = groups.find(g => g.title === title);

      if (group) {
        group.sessions.push(session);
      } else {
        groups.push({ title: title, sessions: [session] });
      }
    });

    return groups;
  }

  makeGroupTitle(item: { createdTs: number; now: number }) {
    let date = new Date(item.createdTs);

    if (item.now - item.createdTs < ONE_WEEK_MS) {
      return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
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

  trackByGroupTitle(_index: number, group: HistorySessionGroup) {
    return group.title;
  }

  closeOverlay() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeOverlay();
  }
}
