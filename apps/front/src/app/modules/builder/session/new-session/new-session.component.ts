import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { PROD_REPO_ID } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { SessionApi } from '#common/interfaces/backend/session-api';
import {
  ToBackendCreateAgentSessionRequestPayload,
  ToBackendCreateAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
import {
  ToBackendGetBranchesListRequestPayload,
  ToBackendGetBranchesListResponse
} from '#common/interfaces/to-backend/branches/to-backend-get-branches-list';
import { makeBranchExtraName } from '#front/app/functions/make-branch-extra-name';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-new-session',
  templateUrl: './new-session.component.html'
})
export class NewSessionComponent implements OnInit {
  sessionTypeEnum = SessionTypeEnum;
  sessionType: SessionTypeEnum = SessionTypeEnum.Explorer;
  sessionTypes = [SessionTypeEnum.Explorer, SessionTypeEnum.Editor];

  agent = 'plan';

  model: string;
  variant = 'default';

  onSessionTypeChange() {
    let uiState = this.uiQuery.getValue();
    let isExplorer = this.sessionType === SessionTypeEnum.Explorer;
    this.model = isExplorer
      ? uiState.newSessionExplorerProviderModel
      : uiState.newSessionEditorProviderModel;
  }

  initialBranch: string;

  branches: { branchId: string; extraName: string }[] = [];
  branchesLoading = false;

  isSubmitting = false;

  constructor(
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private uiService: UiService
  ) {
    let nav = this.navQuery.getValue();
    let isProduction = nav.repoId === PROD_REPO_ID;
    this.initialBranch = isProduction ? nav.branchId : nav.projectDefaultBranch;
  }

  ngOnInit() {
    let uiState = this.uiQuery.getValue();
    this.model = uiState.newSessionExplorerProviderModel;
    this.variant = uiState.newSessionEditorVariant || 'default';

    let nav = this.navQuery.getValue();

    this.branchesLoading = true;

    let payload: ToBackendGetBranchesListRequestPayload = {
      projectId: nav.projectId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetBranchesList,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetBranchesListResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.branches = resp.payload.branchesList
              .filter(b => b.repoType === RepoTypeEnum.Production)
              .map(b => ({
                branchId: b.branchId,
                extraName: makeBranchExtraName({
                  repoType: b.repoType,
                  branchId: b.branchId,
                  alias: ''
                })
              }));
          }
          this.branchesLoading = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  navBranch$ = this.navQuery.branchId$.pipe(
    tap(branchId => {
      let nav = this.navQuery.getValue();
      let isProduction = nav.repoId === PROD_REPO_ID;
      if (isProduction) {
        this.initialBranch = branchId;
      }
    })
  );

  branchesSearchFn(
    term: string,
    branch: { branchId: string; extraName: string }
  ) {
    let haystack = [`${branch.extraName}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  sendMessage(text: string) {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.uiQuery.updatePart({ showContent: false });
    this.spinner.show(APP_SPINNER_NAME);

    let provider = this.model.split('/')[0];

    let nav = this.navQuery.getValue();

    let isSessionExplorer = this.sessionType === SessionTypeEnum.Explorer;

    let payload: ToBackendCreateAgentSessionRequestPayload = {
      projectId: nav.projectId,
      sessionType: this.sessionType,
      sandboxType: isSessionExplorer ? undefined : SandboxTypeEnum.E2B,
      provider: provider,
      model: this.model,
      agent: isSessionExplorer ? undefined : this.agent,
      variant: this.variant,
      envId: nav.envId,
      initialBranch: this.initialBranch,
      firstMessage: text
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateAgentSession,
        payload: payload
      })
      .pipe(
        tap((resp2: ToBackendCreateAgentSessionResponse) => {
          if (resp2.info?.status === ResponseInfoStatusEnum.Ok) {
            let { sessionId, repoId, branchId } = resp2.payload;

            if (!isSessionExplorer) {
              // Type Editor: add new session to the sessions list
              let currentSessions = this.sessionsQuery.getValue().sessions;
              let newSession: SessionApi = {
                sessionId: sessionId,
                sessionType: this.sessionType,
                repoId: repoId,
                branchId: branchId,
                provider: provider,
                agent: this.agent,
                model: this.model,
                lastMessageProviderModel: this.model,
                lastMessageVariant: this.variant,
                initialBranch: this.initialBranch,
                initialCommit: undefined,
                status: SessionStatusEnum.New,
                createdTs: Date.now(),
                lastActivityTs: Date.now(),
                firstMessage: text
              };
              this.sessionsQuery.updatePart({
                sessions: [newSession, ...currentSessions]
              });
            }

            // Persist autoAccept for the new session
            if (this.uiQuery.getValue().newSessionPermissionsAutoAccept) {
              let sessionIds =
                this.uiQuery.getValue().permissionsAutoAcceptSessionIds || [];
              let newSessionIds = [...sessionIds, sessionId];
              this.uiQuery.updatePart({
                permissionsAutoAcceptSessionIds: newSessionIds
              });
              this.uiService.setUserUi({
                permissionsAutoAcceptSessionIds: newSessionIds
              });
            }

            this.navigateService.navigateToSession({
              sessionId: sessionId,
              repoId: repoId,
              branchId: branchId
            });

            this.isSubmitting = false;
            this.cd.detectChanges();
          } else {
            this.isSubmitting = false;
            this.uiQuery.updatePart({ showContent: true });
            this.spinner.hide(APP_SPINNER_NAME);
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
