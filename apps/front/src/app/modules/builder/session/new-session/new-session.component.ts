import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { take, tap } from 'rxjs/operators';
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
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-new-session',
  templateUrl: './new-session.component.html'
})
export class NewSessionComponent implements OnInit {
  isSubmitting = false;

  model = 'default';
  agent = 'plan';
  variant = 'default';

  initialBranch: string;
  branches: string[] = [];
  branchesLoading = false;

  constructor(
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService
  ) {
    this.model = this.uiQuery.getValue().lastSelectedProviderModel || 'default';
    let savedVariant = this.uiQuery.getValue().lastSelectedVariant || 'default';
    this.variant = savedVariant;

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
              .filter(b => b.repoType === RepoTypeEnum.Prod)
              .map(b => b.branchId);
          }
          this.branchesLoading = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  getProviderFromModel(): string {
    if (this.model === 'default') {
      return 'opencode';
    }
    return this.model.split('/')[0];
  }

  sendMessage(text: string) {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    let nav = this.navQuery.getValue();
    let provider = this.getProviderFromModel();

    let payload: ToBackendCreateAgentSessionRequestPayload = {
      projectId: nav.projectId,
      sandboxType: SandboxTypeEnum.E2B,
      provider: provider,
      model: this.model,
      agent: this.agent,
      permissionMode: 'default',
      variant: this.variant !== 'default' ? this.variant : undefined,
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
              lastMessageVariant:
                this.variant !== 'default' ? this.variant : undefined,
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

            // Navigate to session route with session repoId/branchId
            this.navigateService.navigateToSession({
              sessionId: newSession.sessionId,
              repoId: newSession.repoId,
              branchId: newSession.branchId
            });
          }
          this.isSubmitting = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }
}
