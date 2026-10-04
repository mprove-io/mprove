import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { PROD_REPO_ID } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import type { EnvsItem } from '#common/types/backend/parts/envs-item';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionType } from '#common/types/backend/parts/session/session-type';
import type { ToBackendGetBranchesListRequest } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-request';
import type { ToBackendGetBranchesListResponse } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-response';
import type { ToBackendGetEnvsListRequest } from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-request';
import type { ToBackendGetEnvsListResponse } from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-response';
import type { ToBackendCreateEditorSessionRequest } from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-request';
import type { ToBackendCreateEditorSessionResponse } from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-response';
import type { ToBackendCreateExplorerSessionRequest } from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-request';
import type { ToBackendCreateExplorerSessionResponse } from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-response';
import { makeAscendingId } from '#front/app/functions/make-ascending-id';
import { makeBranchExtraName } from '#front/app/functions/make-branch-extra-name';
import { splitModelExtraId } from '#front/app/functions/split-model-extra-id';
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
  sessionType: SessionType = 'Editor';

  agent = 'build';

  modelExtraId: string;
  variant = 'default';

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
    this.sessionType = this.chatScope === 'explorer' ? 'Explorer' : 'Editor';

    let nav = this.navQuery.getValue();
    let isProduction = nav.repoId === PROD_REPO_ID;
    this.initialBranch = isProduction ? nav.branchId : nav.projectDefaultBranch;
    this.baseEnvId = nav.envId;

    let user = this.userQuery.getValue();

    let extraName = makeBranchExtraName({
      repoType: 'production',
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
    let isExplorer = this.sessionType === 'Explorer';
    this.modelExtraId = isExplorer
      ? uiState.newSessionExplorerModelExtraId
      : uiState.newSessionEditorModelExtraId;
    this.variant = isExplorer
      ? uiState.newSessionExplorerVariant || 'default'
      : uiState.newSessionEditorVariant || 'default';
  }

  openBranchSelect() {
    this.branchesLoading = true;

    let nav = this.navQuery.getValue();
    let user = this.userQuery.getValue();

    let payload: ToBackendGetBranchesListRequest['input'] = {
      projectId: nav.projectId
    };

    this.apiService
      .req({
        route: 'api/ToBackendGetBranchesList',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetBranchesListResponse) => {
          if (resp?.type === 'Success') {
            this.branches = resp.output.branchesList
              .filter(b => b.repoType === 'production')
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

    let payload: ToBackendGetEnvsListRequest['input'] = {
      projectId: nav.projectId,
      isFilter: true
    };

    this.apiService
      .req({
        route: 'api/ToBackendGetEnvsList',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetEnvsListResponse) => {
          if (resp?.type === 'Success') {
            this.envs = resp.output.envsList;
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
          repoType: 'production',
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

    let modelSelection = splitModelExtraId(this.modelExtraId);

    if (!modelSelection) {
      return;
    }

    this.isSubmitting = true;
    this.uiQuery.updatePart({ showContent: false });
    this.spinner.show(APP_SPINNER_NAME);

    let providerId = modelSelection.providerID;

    let modelId = modelSelection.modelID;

    let nav = this.navQuery.getValue();

    let isSessionExplorer = this.sessionType === 'Explorer';

    let messageId = makeAscendingId({ prefix: 'message' });
    let partId = makeAscendingId({ prefix: 'part' });

    if (isSessionExplorer) {
      let explorerPayload: ToBackendCreateExplorerSessionRequest['input'] = {
        projectId: nav.projectId,
        repoId: nav.repoId,
        providerId: providerId,
        modelId: modelId,
        variant: this.variant,
        branchId: nav.branchId,
        envId: nav.envId,
        firstMessage: text,
        messageId: messageId,
        partId: partId
      };

      this.apiService
        .req({
          route: 'api/ToBackendCreateExplorerSession',
          payload: explorerPayload
        })
        .pipe(
          tap((resp: ToBackendCreateExplorerSessionResponse) => {
            this.processCreateSessionResponse({
              resp: resp,
              isSessionExplorer: isSessionExplorer,
              providerId: providerId,
              modelId: modelId,
              text: text,
              messageId: messageId,
              partId: partId
            });
          }),
          take(1)
        )
        .subscribe();
    } else {
      let editorPayload: ToBackendCreateEditorSessionRequest['input'] = {
        projectId: nav.projectId,
        sandboxType: 'E2B',
        providerId: providerId,
        modelId: modelId,
        agent: this.agent,
        variant: this.variant,
        envId: this.baseEnvId,
        initialBranch: this.initialBranch,
        firstMessage: text,
        messageId: messageId,
        partId: partId
      };

      this.apiService
        .req({
          route: 'api/ToBackendCreateEditorSession',
          payload: editorPayload
        })
        .pipe(
          tap((resp: ToBackendCreateEditorSessionResponse) => {
            this.processCreateSessionResponse({
              resp: resp,
              isSessionExplorer: isSessionExplorer,
              providerId: providerId,
              modelId: modelId,
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
    providerId: string;
    modelId: string;
    text: string;
    messageId: string;
    partId: string;
  }) {
    let {
      resp,
      isSessionExplorer,
      providerId,
      modelId,
      text,
      messageId,
      partId
    } = item;

    if (resp?.type === 'Success') {
      let { sessionId, repoId, branchId, envId } = resp.output;

      if (!isSessionExplorer) {
        // Type Editor: add new session to the sessions list
        let currentSessions = this.sessionsQuery.getValue().sessions;
        let newSession: SessionApi = {
          sessionId: sessionId,
          type: this.sessionType,
          repoId: repoId,
          branchId: branchId,
          agent: this.agent,
          providerId: providerId,
          modelId: modelId,
          lastMessageVariant: this.variant,
          initialBranch: this.initialBranch,
          envId: envId,
          initialCommit: undefined,
          status: 'New',
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

      this.sessionService.setPendingFirstMessage({
        sessionId: sessionId,
        messageId: messageId,
        partId: partId,
        text: text,
        agent: this.agent,
        providerId: providerId,
        modelId: modelId,
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
