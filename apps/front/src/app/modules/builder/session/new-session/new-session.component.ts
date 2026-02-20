import { ChangeDetectorRef, Component } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import {
  ToBackendCreateAgentSessionRequestPayload,
  ToBackendCreateAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
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
export class NewSessionComponent {
  isSubmitting = false;

  model = 'default';
  agent = 'plan';
  variant = 'default';

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
            let sessionId = resp.payload.sessionId;

            // Add new session to the sessions list
            let currentSessions = this.sessionsQuery.getValue().sessions;
            let newSession: AgentSessionApi = {
              sessionId: sessionId,
              provider: provider,
              agent: this.agent,
              model: this.model,
              lastMessageProviderModel: this.model,
              lastMessageVariant:
                this.variant !== 'default' ? this.variant : undefined,
              status: SessionStatusEnum.New,
              createdTs: Date.now(),
              lastActivityTs: Date.now(),
              firstMessage: text
            };
            this.sessionsQuery.updatePart({
              sessions: [newSession, ...currentSessions]
            });

            // Navigate to session route
            this.navigateService.navigateToSession({ sessionId: sessionId });
          }
          this.isSubmitting = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }
}
