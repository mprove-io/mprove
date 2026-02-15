import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { combineLatest, interval, Subscription } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
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
import {
  ToBackendGetAgentSessionRequestPayload,
  ToBackendGetAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
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

interface ChatTurn {
  userMessage?: ChatMessage;
  responses: ChatMessage[];
}

@Component({
  standalone: false,
  selector: 'm-session',
  templateUrl: './session.component.html'
})
export class SessionComponent implements OnDestroy {
  messageText = '';
  isSubmitting = false;

  agent = 'opencode';
  agentMode = 'code';

  agents = ['claude', 'opencode', 'codex'];
  agentModes = ['plan', 'code'];

  // Chat mode
  session: AgentSessionApi;
  events: AgentEventApi[] = [];
  messages: ChatMessage[] = [];
  turns: ChatTurn[] = [];
  scrollTrigger = 0;
  showSessionMessages = true;
  private previousTurnsCount = 0;
  private previousLastTurnResponsesExist = false;
  private previousSessionId: string;
  private userSentMessage = false;
  isChatMode = false;
  isActivating = false;
  isWaitingForResponse = false;
  isSessionError = false;
  debugMode = false;
  eventSource: EventSource;

  // Polling
  private pollSubscription: Subscription;

  sessionAndEvents$ = combineLatest([
    this.sessionQuery.select(),
    this.sessionEventsQuery.events$
  ]).pipe(
    tap(([sessionValue, eventsValue]) => {
      this.session = sessionValue?.sessionId ? sessionValue : undefined;

      if (this.session) {
        this.agent = this.session.agent;
        this.agentMode = this.session.agentMode;
      }

      // Start polling when session is New
      if (
        this.session?.status === SessionStatusEnum.New &&
        !this.pollSubscription
      ) {
        this.startPolling(this.session.sessionId);
      }

      // Stop polling when session is no longer New
      if (
        this.session?.status !== SessionStatusEnum.New &&
        this.pollSubscription
      ) {
        this.stopPolling();
      }

      // Connect SSE when session becomes active and no SSE is open
      if (
        this.session?.status === SessionStatusEnum.Active &&
        !this.eventSource
      ) {
        this.connectSse(this.session.sessionId);
      }

      this.events = eventsValue;
      this.messages = this.buildMessages(eventsValue);
      this.turns = this.buildTurns(this.messages);

      this.isChatMode = !!this.session;
      this.isActivating = this.session?.status === SessionStatusEnum.New;
      this.isWaitingForResponse = this.checkIsWaitingForResponse();
      this.isSessionError = this.session?.status === SessionStatusEnum.Error;

      if (!this.showSessionMessages) {
        this.uiQuery.updatePart({ showSessionMessages: true });
      }

      this.cd.detectChanges();

      let currentSessionId = this.session?.sessionId;
      let sessionChanged = currentSessionId !== this.previousSessionId;
      this.previousSessionId = currentSessionId;

      if (sessionChanged) {
        this.previousTurnsCount = this.turns.length;
        this.previousLastTurnResponsesExist =
          this.turns[this.turns.length - 1]?.responses?.length > 0;
        return;
      }

      let shouldScroll = false;

      // Scroll only when user sent a message and new turn appeared
      if (this.userSentMessage && this.turns.length > this.previousTurnsCount) {
        shouldScroll = true;
        this.userSentMessage = false;
      }

      // First response in current turn
      let lastTurn = this.turns[this.turns.length - 1];
      let lastTurnHasResponses = lastTurn?.responses?.length > 0;
      if (lastTurnHasResponses && !this.previousLastTurnResponsesExist) {
        shouldScroll = true;
      }

      this.previousTurnsCount = this.turns.length;
      this.previousLastTurnResponsesExist = lastTurnHasResponses;

      if (shouldScroll) {
        this.scrollTrigger++;
      }
    })
  );

  debugMode$ = this.uiQuery.sessionDebugMode$.pipe(
    tap(x => {
      this.debugMode = x;
      this.cd.detectChanges();
    })
  );

  showSessionMessages$ = this.uiQuery.showSessionMessages$.pipe(
    tap(x => {
      this.showSessionMessages = x;
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
    this.stopPolling();
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

    this.userSentMessage = true;
    this.isSubmitting = true;

    let nav = this.navQuery.getValue();
    let firstMessageText = this.messageText.trim();

    this.messageText = '';

    let payload: ToBackendCreateAgentSessionRequestPayload = {
      projectId: nav.projectId,
      sandboxType: SandboxTypeEnum.E2B,
      agent: this.agent,
      model: 'unk',
      agentMode: this.agentMode,
      permissionMode: 'default',
      firstMessage: firstMessageText
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
              agent: this.agent,
              agentMode: this.agentMode,
              status: SessionStatusEnum.New,
              createdTs: Date.now(),
              lastActivityTs: Date.now(),
              firstMessage: firstMessageText
            };
            this.sessionsQuery.updatePart({
              sessions: [newSession, ...currentSessions]
            });

            // Navigate to session route (resolver will load session, polling starts via subscription)
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

    this.userSentMessage = true;
    this.isSubmitting = true;

    let payload: ToBackendSendAgentMessageRequestPayload = {
      sessionId: this.session.sessionId,
      message: this.messageText.trim()
    };

    this.messageText = '';

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSendAgentMessage,
        payload: payload
      })
      .pipe(
        tap(() => {
          this.isSubmitting = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  private startPolling(sessionId: string) {
    this.pollSubscription = interval(1000)
      .pipe(
        switchMap(() =>
          this.apiService.req({
            pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
            payload: {
              sessionId: sessionId
            } as ToBackendGetAgentSessionRequestPayload
          })
        ),
        tap((resp: ToBackendGetAgentSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.sessionQuery.update(resp.payload.session);

            if (resp.payload.events.length > 0) {
              this.sessionEventsQuery.updatePart({
                events: resp.payload.events
              });
            }

            // Update session in the sessions list
            let sessions = this.sessionsQuery.getValue().sessions;
            let updated = sessions.map(s =>
              s.sessionId === sessionId ? resp.payload.session : s
            );
            this.sessionsQuery.updatePart({ sessions: updated });
          }
        })
      )
      .subscribe();
  }

  private stopPolling() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
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

      // Deduplicate by eventIndex
      let exists = currentEvents.some(
        e => e.eventIndex === agentEvent.eventIndex
      );
      if (exists) {
        return;
      }

      let updatedEvents = [...currentEvents, agentEvent].sort(
        (a, b) => a.eventIndex - b.eventIndex
      );

      this.sessionEventsQuery.updatePart({ events: updatedEvents });
    });
  }

  private closeSse() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private checkIsWaitingForResponse(): boolean {
    if (this.session?.status !== SessionStatusEnum.Active) {
      return false;
    }
    if (this.messages.length === 0) {
      return true;
    }
    let lastMessage = this.messages[this.messages.length - 1];
    return lastMessage.sender === 'user' || lastMessage.sender === 'tool';
  }

  private buildTurns(messages: ChatMessage[]): ChatTurn[] {
    let turns: ChatTurn[] = [];
    let currentTurn: ChatTurn | undefined;

    for (let msg of messages) {
      if (msg.sender === 'user') {
        currentTurn = { userMessage: msg, responses: [] };
        turns.push(currentTurn);
      } else {
        if (!currentTurn) {
          currentTurn = { responses: [] };
          turns.push(currentTurn);
        }
        currentTurn.responses.push(msg);
      }
    }

    return turns;
  }

  private buildMessages(events: AgentEventApi[]): ChatMessage[] {
    let messages: ChatMessage[] = [];
    let currentMessage: ChatMessage;

    // Only process contiguous events (stop at first gap in eventIndex)
    let contiguousEvents: AgentEventApi[] = [];
    for (let i = 0; i < events.length; i++) {
      if (i > 0 && events[i].eventIndex !== events[i - 1].eventIndex + 1) {
        break;
      }
      contiguousEvents.push(events[i]);
    }

    for (let event of contiguousEvents) {
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
