import { ChangeDetectorRef, Component } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendCreateAgentSessionRequestPayload,
  ToBackendCreateAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
import { NavQuery } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';

@Component({
  standalone: false,
  selector: 'm-sessions-chat-input',
  templateUrl: './sessions-chat-input.component.html'
})
export class SessionsChatInputComponent {
  messageText = '';
  isSubmitting = false;

  agent = 'claude';
  agentMode = 'plan';

  agents = ['claude', 'opencode', 'codex'];
  agentModes = ['plan', 'code'];

  constructor(
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private apiService: ApiService
  ) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.messageText.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.cd.detectChanges();

    let nav = this.navQuery.getValue();

    let payload: ToBackendCreateAgentSessionRequestPayload = {
      projectId: nav.projectId,
      sandboxType: SandboxTypeEnum.E2B,
      agent: this.agent,
      model: 'unk',
      agentMode: this.agentMode,
      permissionMode: 'default',
      firstMessage: this.messageText.trim()
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateAgentSession,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateAgentSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.messageText = '';
          }
          this.isSubmitting = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  // onWheel(event: WheelEvent) {
  //   let target = event.currentTarget as HTMLElement;
  //   let multiplier = 1;
  //   target.scrollTop += event.deltaY * multiplier;
  //   event.preventDefault();
  // }
}
