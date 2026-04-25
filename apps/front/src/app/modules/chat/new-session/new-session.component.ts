import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import type { EnvsItem } from '#common/zod/backend/envs-item';
import type { SessionApi } from '#common/zod/backend/session-api';
import type {
  ToBackendGetBranchesListRequestPayload,
  ToBackendGetBranchesListResponse
} from '#common/zod/to-backend/branches/to-backend-get-branches-list';
import type {
  ToBackendGetEnvsListRequestPayload,
  ToBackendGetEnvsListResponse
} from '#common/zod/to-backend/envs/to-backend-get-envs-list';
import type {
  ToBackendCreateEditorSessionRequestPayload,
  ToBackendCreateEditorSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-create-editor-session';
import type {
  ToBackendCreateExplorerSessionRequestPayload,
  ToBackendCreateExplorerSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-create-explorer-session';
import { makeAscendingId } from '#front/app/functions/make-ascending-id';
import { makeBranchExtraName } from '#front/app/functions/make-branch-extra-name';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SessionService } from '#front/app/services/session.service';
import { UiService } from '#front/app/services/ui.service';
import { CHAT_SCOPE, ChatScope } from '../chat-scope.token';

@Component({
  standalone: false,
  selector: 'm-new-session',
  templateUrl: './new-session.component.html'
})
export class NewSessionComponent implements OnInit {
  sessionType: SessionTypeEnum = SessionTypeEnum.Editor;

  agent = 'build';

  model: string;
  variant = 'default';
  useCodex = true;

  toggleUseCodex() {
    this.useCodex = !this.useCodex;
  }

  initialBranch: string;
  branches: { branchId: string; extraName: string }[] = [];
  branchesLoading = false;

  baseEnvId: string;
  envs: EnvsItem[] = [];
  envsLoading = false;

  isSubmitting = false;

  constructor(
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private navigateService: NavigateService,
    private sessionService: SessionService,
    private uiService: UiService,
    @Inject(CHAT_SCOPE) public chatScope: ChatScope
  ) {
    this.sessionType =
      this.chatScope === 'explorer'
        ? SessionTypeEnum.Explorer
        : SessionTypeEnum.Editor;

    let nav = this.navQuery.getValue();
    let isProduction = nav.repoId === PROD_REPO_ID;
    this.initialBranch = isProduction ? nav.branchId : nav.projectDefaultBranch;
    this.baseEnvId = nav.envId;

    let user = this.userQuery.getValue();

    let extraName = makeBranchExtraName({
      repoType: RepoTypeEnum.Production,
      branchId: this.initialBranch,
      alias: user.alias
    });
    let branchItem = { branchId: this.initialBranch, extraName: extraName };
    let branchAlreadyPresent = this.branches.some(
      b => b.branchId === branchItem.branchId
    );
    this.branches = branchAlreadyPresent ? this.branches : [branchItem];

    let envsItem: EnvsItem = {
      envId: this.baseEnvId,
      projectId: nav.projectId
    };
    let envAlreadyPresent = this.envs.some(e => e.envId === envsItem.envId);
    this.envs = envAlreadyPresent ? this.envs : [envsItem];
  }

  ngOnInit() {
    let uiState = this.uiQuery.getValue();
    let isExplorer = this.sessionType === SessionTypeEnum.Explorer;
    this.model = isExplorer
      ? uiState.newSessionExplorerProviderModel
      : uiState.newSessionEditorProviderModel;
    this.variant = uiState.newSessionEditorVariant || 'default';
    this.useCodex = uiState.newSessionUseCodex !== false; // "undefined" -> true
  }

  openBranchSelect() {
    this.branchesLoading = true;

    let nav = this.navQuery.getValue();
    let user = this.userQuery.getValue();

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
                  alias: user.alias
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

  openEnvSelect() {
    this.envsLoading = true;

    let nav = this.navQuery.getValue();

    let payload: ToBackendGetEnvsListRequestPayload = {
      projectId: nav.projectId,
      isFilter: true
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetEnvsListResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.envs = resp.payload.envsList;
          }
          this.envsLoading = false;
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

        let user = this.userQuery.getValue();
        let extraName = makeBranchExtraName({
          repoType: RepoTypeEnum.Production,
          branchId: branchId,
          alias: user.alias
        });
        let newBranchItem = { branchId: branchId, extraName: extraName };
        let alreadyPresent = this.branches.some(b => b.branchId === branchId);
        this.branches = alreadyPresent ? this.branches : [newBranchItem];
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

    let messageId = makeAscendingId({ prefix: 'message' });
    let partId = makeAscendingId({ prefix: 'part' });

    if (isSessionExplorer) {
      let explorerPayload: ToBackendCreateExplorerSessionRequestPayload = {
        projectId: nav.projectId,
        provider: provider,
        model: this.model,
        variant: this.variant,
        initialBranch: this.initialBranch,
        envId: this.baseEnvId,
        firstMessage: text,
        messageId: messageId,
        partId: partId,
        useCodex: this.useCodex
      };

      this.apiService
        .req({
          pathInfoName:
            ToBackendRequestInfoNameEnum.ToBackendCreateExplorerSession,
          payload: explorerPayload
        })
        .pipe(
          tap((resp: ToBackendCreateExplorerSessionResponse) => {
            this.processCreateSessionResponse({
              resp: resp,
              isSessionExplorer: isSessionExplorer,
              provider: provider,
              text: text,
              messageId: messageId,
              partId: partId
            });
          }),
          take(1)
        )
        .subscribe();
    } else {
      let editorPayload: ToBackendCreateEditorSessionRequestPayload = {
        projectId: nav.projectId,
        sandboxType: SandboxTypeEnum.E2B,
        provider: provider,
        model: this.model,
        agent: this.agent,
        variant: this.variant,
        envId: this.baseEnvId,
        initialBranch: this.initialBranch,
        firstMessage: text,
        messageId: messageId,
        partId: partId,
        useCodex: this.useCodex
      };

      this.apiService
        .req({
          pathInfoName:
            ToBackendRequestInfoNameEnum.ToBackendCreateEditorSession,
          payload: editorPayload
        })
        .pipe(
          tap((resp: ToBackendCreateEditorSessionResponse) => {
            this.processCreateSessionResponse({
              resp: resp,
              isSessionExplorer: isSessionExplorer,
              provider: provider,
              text: text,
              messageId: messageId,
              partId: partId
            });
          }),
          take(1)
        )
        .subscribe();
    }
  }

  processCreateSessionResponse(item: {
    resp:
      | ToBackendCreateExplorerSessionResponse
      | ToBackendCreateEditorSessionResponse;
    isSessionExplorer: boolean;
    provider: string;
    text: string;
    messageId: string;
    partId: string;
  }) {
    let { resp, isSessionExplorer, provider, text, messageId, partId } = item;

    if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
      let { sessionId, repoId, branchId, envId } = resp.payload;

      if (!isSessionExplorer) {
        // Type Editor: add new session to the sessions list
        let currentSessions = this.sessionsQuery.getValue().sessions;
        let newSession: SessionApi = {
          sessionId: sessionId,
          type: this.sessionType,
          repoId: repoId,
          branchId: branchId,
          provider: provider,
          agent: this.agent,
          model: this.model,
          lastMessageProviderModel: this.model,
          lastMessageVariant: this.variant,
          initialBranch: this.initialBranch,
          envId: envId,
          initialCommit: undefined,
          status: SessionStatusEnum.New,
          createdTs: Date.now(),
          lastActivityTs: Date.now(),
          firstMessage: text,
          useCodex: this.useCodex
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

      this.sessionService.setPendingFirstMessage({
        sessionId: sessionId,
        messageId: messageId,
        partId: partId,
        text: text,
        agent: this.agent,
        model: this.model,
        variant: this.variant
      });

      if (this.chatScope === 'explorer') {
        this.navigateService.navigateToExplorerSession({
          sessionId: sessionId,
          repoId: repoId,
          branchId: branchId,
          envId: envId
        });
      } else {
        this.navigateService.navigateToSession({
          sessionId: sessionId,
          repoId: repoId,
          branchId: branchId,
          envId: envId
        });
      }

      this.isSubmitting = false;
      this.cd.detectChanges();
    } else {
      this.isSubmitting = false;
      this.uiQuery.updatePart({ showContent: true });
      this.spinner.hide(APP_SPINNER_NAME);
      this.cd.detectChanges();
    }
  }
}
