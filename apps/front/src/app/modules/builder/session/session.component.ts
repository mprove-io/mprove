import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import {
  ToBackendCreateAgentSessionRequestPayload,
  ToBackendCreateAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
import {
  ToBackendCreateAgentSseTicketRequestPayload,
  ToBackendCreateAgentSseTicketResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-sse-ticket';
import { ToBackendSendAgentMessageRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-send-agent-message';
import { NavQuery } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { environment } from '#front/environments/environment';

interface ChatMessage {
  sender: string;
  text: string;
}

@Component({
  standalone: false,
  selector: 'm-session',
  templateUrl: './session.component.html'
})
export class SessionComponent implements OnDestroy {
  messageText = '';
  isSubmitting = false;

  agent = 'codex';
  agentMode = 'code';

  agents = ['claude', 'opencode', 'codex'];
  agentModes = ['plan', 'code'];

  // Chat mode
  session: AgentSessionApi;
  events: AgentEventApi[] = [];
  messages: ChatMessage[] = [];
  debugMode = false;
  eventSource: EventSource;

  session$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.session = x?.sessionId ? x : undefined;

      if (this.session) {
        this.agent = this.session.agent;
        this.agentMode = this.session.agentMode;
      }

      // Connect SSE when session becomes active and no SSE is open
      if (
        this.session?.status === SessionStatusEnum.Active &&
        !this.eventSource
      ) {
        this.connectSse(this.session.sessionId);
      }

      this.cd.detectChanges();
    })
  );

  events$ = this.sessionEventsQuery.events$.pipe(
    tap(x => {
      this.events = x;
      this.messages = this.buildMessages(x);
      this.cd.detectChanges();
    })
  );

  debugMode$ = this.uiQuery.sessionDebugMode$.pipe(
    tap(x => {
      this.debugMode = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private sessionQuery: SessionQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService
  ) {}

  ngOnDestroy() {
    this.closeSse();
  }

  get isChatMode(): boolean {
    return !!this.session;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.isChatMode) {
        this.sendFollowUp();
      } else {
        this.sendMessage();
      }
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
            let sessionId = resp.payload.sessionId;

            // Add new session to the sessions list
            let currentSessions = this.sessionsQuery.getValue().sessions;
            let newSession: AgentSessionApi = {
              sessionId: sessionId,
              agent: this.agent,
              agentMode: this.agentMode,
              status: SessionStatusEnum.Active,
              createdTs: Date.now(),
              lastActivityTs: Date.now()
            };
            this.sessionsQuery.updatePart({
              sessions: [newSession, ...currentSessions]
            });

            this.messageText = '';

            // Navigate to session route (resolver will load session, SSE connects via subscription)
            this.navigateService.navigateToSession({ sessionId: sessionId });
          }
          this.isSubmitting = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  sendFollowUp() {
    if (!this.messageText.trim() || this.isSubmitting || !this.session) {
      return;
    }

    this.isSubmitting = true;
    this.cd.detectChanges();

    let payload: ToBackendSendAgentMessageRequestPayload = {
      sessionId: this.session.sessionId,
      message: this.messageText.trim()
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSendAgentMessage,
        payload: payload
      })
      .pipe(
        tap(() => {
          this.messageText = '';
          this.isSubmitting = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  private connectSse(sessionId: string) {
    // Get a fresh SSE ticket, then connect
    let payload: ToBackendCreateAgentSseTicketRequestPayload = {
      sessionId: sessionId
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendCreateAgentSseTicket,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateAgentSseTicketResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.connectSseWithTicket(sessionId, resp.payload.sseTicket);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  private connectSseWithTicket(sessionId: string, sseTicket: string) {
    this.closeSse();

    let url =
      environment.httpUrl +
      `/api/sse/agent-events?sessionId=${sessionId}&ticket=${sseTicket}`;

    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('agent-event', (event: MessageEvent) => {
      let agentEvent: AgentEventApi = JSON.parse(event.data);

      let currentEvents = this.sessionEventsQuery.getValue().events;
      let updatedEvents = [...currentEvents, agentEvent];

      this.sessionEventsQuery.updatePart({ events: updatedEvents });
    });
  }

  private closeSse() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private buildMessages(events: AgentEventApi[]): ChatMessage[] {
    let messages: ChatMessage[] = [];
    let currentMessage: ChatMessage;

    for (let event of events) {
      let p = event.payload as { method?: string; params?: any };

      // User messages: session/prompt requests from client
      if (event.sender === 'client' && p?.method === 'session/prompt') {
        let prompt = p.params?.prompt;
        if (Array.isArray(prompt)) {
          for (let block of prompt) {
            if (block.type === 'text' && block.text) {
              if (currentMessage && currentMessage.sender === 'user') {
                currentMessage.text += block.text;
              } else {
                currentMessage = { sender: 'user', text: block.text };
                messages.push(currentMessage);
              }
            }
          }
        }
        continue;
      }

      // Agent messages: session/update notifications
      let update = p?.params?.update;
      let sessionUpdate = update?.sessionUpdate;

      if (sessionUpdate === 'agent_message_chunk') {
        let text = update?.content?.text || '';

        if (currentMessage && currentMessage.sender === 'agent') {
          currentMessage.text += text;
        } else {
          currentMessage = { sender: 'agent', text };
          messages.push(currentMessage);
        }
      } else if (sessionUpdate === 'tool_call') {
        let toolName = update?.name || 'tool';
        currentMessage = { sender: 'tool', text: toolName };
        messages.push(currentMessage);
        currentMessage = undefined;
      } else if (sessionUpdate === 'agent_thought_chunk') {
        let text = update?.content?.text || '';
        if (currentMessage && currentMessage.sender === 'thought') {
          currentMessage.text += text;
        } else {
          currentMessage = { sender: 'thought', text };
          messages.push(currentMessage);
        }
      }
    }

    return messages;
  }
}
