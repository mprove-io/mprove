import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
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
  agent = 'plan';

  model = 'default';
  newSessionProviderModel$ = this.uiQuery.newSessionProviderModel$.pipe(
    tap(newSessionProviderModel => {
      this.model = newSessionProviderModel;
      this.cd.detectChanges();
    })
  );

  variant = 'default';
  newSessionVariant$ = this.uiQuery.newSessionVariant$.pipe(
    tap(newSessionVariant => {
      this.variant = newSessionVariant;
      this.cd.detectChanges();
    })
  );

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
    this.initialBranch = this.navQuery.getValue().projectDefaultBranch;
  }

  ngOnInit() {
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

  sendMessage(text: string) {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.uiQuery.updatePart({ showContent: false });
    this.spinner.show(APP_SPINNER_NAME);

    let provider =
      this.model === 'default' ? 'opencode' : this.model.split('/')[0];

    let nav = this.navQuery.getValue();

    let payload: ToBackendCreateAgentSessionRequestPayload = {
      projectId: nav.projectId,
      sandboxType: SandboxTypeEnum.E2B,
      provider: provider,
      model: this.model,
      agent: this.agent,
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
        tap((resp: ToBackendCreateAgentSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let { sessionId, repoId, branchId } = resp.payload;

            // Add new session to the sessions list
            let currentSessions = this.sessionsQuery.getValue().sessions;
            let newSession: SessionApi = {
              sessionId: sessionId,
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

            // Navigate to session route with session repoId/branchId
            this.navigateService.navigateToSession({
              sessionId: newSession.sessionId,
              repoId: newSession.repoId,
              branchId: newSession.branchId
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
