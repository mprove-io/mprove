import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
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
import { groupPartsByMessageId } from '#front/app/functions/group-parts-by-message-id';
import { makeBranchExtraName } from '#front/app/functions/make-branch-extra-name';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { AgentEventsService } from '#front/app/services/agent-events.service';
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
  sessionType: SessionTypeEnum = SessionTypeEnum.A;
  sessionTypes = [SessionTypeEnum.A, SessionTypeEnum.B];

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
    private sessionQuery: SessionQuery,
    private sessionsQuery: SessionsQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private uiQuery: UiQuery,
    private agentEventsService: AgentEventsService,
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

    let provider =
      this.model === 'default' ? 'opencode' : this.model.split('/')[0];

    let nav = this.navQuery.getValue();

    let isTypeA = this.sessionType === SessionTypeEnum.A;

    let payload: ToBackendCreateAgentSessionRequestPayload = {
      projectId: nav.projectId,
      sessionType: this.sessionType,
      sandboxType: isTypeA ? undefined : SandboxTypeEnum.E2B,
      provider: provider,
      model: this.model,
      agent: isTypeA ? undefined : this.agent,
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

            // For session A: populate stores from expanded create response
            if (isTypeA && resp.payload.session) {
              this.agentEventsService.resetAll();

              this.sessionQuery.update(resp.payload.session);

              if (resp.payload.sessions && resp.payload.sessions.length > 0) {
                this.sessionsQuery.updatePart({
                  sessions: resp.payload.sessions,
                  isListLoaded: true,
                  hasMoreArchived: resp.payload.hasMoreArchived ?? false
                });
              }

              this.sessionEventsQuery.updatePart({
                events: resp.payload.events || []
              });

              this.sessionBundleQuery.updatePart({
                messages: resp.payload.messages || [],
                parts: resp.payload.parts
                  ? groupPartsByMessageId(resp.payload.parts)
                  : {},
                todos: [],
                questions: [],
                permissions: [],
                ocSessionStatus: resp.payload.ocSession?.ocSessionStatus,
                lastSessionError: resp.payload.ocSession?.lastSessionError,
                isLastErrorRecovered:
                  resp.payload.ocSession?.isLastErrorRecovered
              });
            } else {
              // Type B: add new session to the sessions list
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

            // Navigate to session route
            // Type A: use current nav repo/branch (no session repo)
            // Type B: use session repo/branch
            if (isTypeA) {
              this.navigateService.navigateToSession({
                sessionId: sessionId
              });
            } else {
              this.navigateService.navigateToSession({
                sessionId: sessionId,
                repoId: repoId,
                branchId: branchId
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
        }),
        take(1)
      )
      .subscribe();
  }
}
