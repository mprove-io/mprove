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
import { ToBackendGetAgentProviderModelsResponse } from '#common/interfaces/to-backend/agent/to-backend-get-agent-provider-models';
import {
  ToBackendGetAgentSessionRequestPayload,
  ToBackendGetAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import { ToBackendGetAgentSessionModelsResponse } from '#common/interfaces/to-backend/agent/to-backend-get-agent-session-models';
import { ToBackendRespondToAgentPermissionRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-respond-to-agent-permission';
import { ToBackendSendAgentMessageRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-send-agent-message';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProjectQuery } from '#front/app/queries/project.query';
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
  permissionId?: string;
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

  provider = 'opencode';
  model = 'default';
  agent = 'plan';
  variant = 'default';

  providers = [
    { id: 'opencode', label: 'Zen' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Anthropic' }
  ];
  models: { value: string; label: string }[] = [
    { value: 'default', label: 'default' }
  ];
  agents = ['build', 'plan'];
  variants: string[] = ['default'];
  private modelVariantsMap = new Map<string, string[]>();
  providerHasApiKey = true;

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
  private sseRetryCount = 0;
  private readonly SSE_MAX_RETRIES = 5;
  private readonly SSE_RETRY_DELAY_MS = 3000;

  // Polling
  private pollSubscription: Subscription;

  sessionAndEvents$ = combineLatest([
    this.sessionQuery.select(),
    this.sessionEventsQuery.events$
  ]).pipe(
    tap(([sessionValue, eventsValue]) => {
      this.session = sessionValue?.sessionId ? sessionValue : undefined;

      // Detect session change and close old connections
      let currentSessionId = this.session?.sessionId;
      let sessionChanged = currentSessionId !== this.previousSessionId;

      if (sessionChanged && this.session) {
        this.provider = this.session.provider;
        this.agent = this.session.agentMode;
        this.model = this.session.model || 'default';
        this.variant = 'default';
        this.closeSse();
        this.stopPolling();
        this.sseRetryCount = 0;
        this.models = [{ value: 'default', label: 'default' }];
        this.variants = ['default'];
        this.modelVariantsMap.clear();
        this.updateProviderHasApiKey();
        setTimeout(() => this.fetchProviderModels(this.provider));
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

      // Fetch models when session becomes active
      if (
        this.session?.status === SessionStatusEnum.Active &&
        this.models.length === 1
      ) {
        this.fetchModels(this.session.sessionId);
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

      this.previousSessionId = currentSessionId;

      if (sessionChanged) {
        this.messageText = '';
        this.isSubmitting = false;
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
    private projectQuery: ProjectQuery,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private sessionQuery: SessionQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService
  ) {
    this.updateProviderHasApiKey();
    setTimeout(() => this.fetchProviderModels(this.provider));
  }

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
      provider: this.provider,
      model: this.model,
      agentMode: this.agent,
      permissionMode: 'default',
      variant: this.variant !== 'default' ? this.variant : undefined,
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
              provider: this.provider,
              agentMode: this.agent,
              model: this.model,
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
    if (!this.messageText.trim() || !this.session) {
      return;
    }

    this.userSentMessage = true;

    let payload: ToBackendSendAgentMessageRequestPayload = {
      sessionId: this.session.sessionId,
      message: this.messageText.trim(),
      model: this.model,
      variant: this.variant !== 'default' ? this.variant : undefined
    };

    this.messageText = '';

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSendAgentMessage,
        payload: payload
      })
      .pipe(take(1))
      .subscribe();
  }

  respondToPermission(event: { permissionId: string; reply: string }) {
    if (!this.session) {
      return;
    }

    let payload: ToBackendRespondToAgentPermissionRequestPayload = {
      sessionId: this.session.sessionId,
      permissionId: event.permissionId,
      reply: event.reply
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendRespondToAgentPermission,
        payload: payload
      })
      .pipe(take(1))
      .subscribe();
  }

  onProviderChange() {
    this.model = 'default';
    this.variant = 'default';
    this.models = [{ value: 'default', label: 'default' }];
    this.variants = ['default'];
    this.modelVariantsMap.clear();
    this.updateProviderHasApiKey();
    setTimeout(() => this.fetchProviderModels(this.provider));
  }

  private updateProviderHasApiKey() {
    let project = this.projectQuery.getValue();
    if (this.provider === 'opencode') {
      this.providerHasApiKey = !!project.isZenApiKeySet;
    } else if (this.provider === 'openai') {
      this.providerHasApiKey = !!project.isOpenaiApiKeySet;
    } else if (this.provider === 'anthropic') {
      this.providerHasApiKey = !!project.isAnthropicApiKeySet;
    } else {
      this.providerHasApiKey = false;
    }
  }

  onModelChange() {
    this.updateVariants();
  }

  private updateVariants() {
    let modelVariants = this.modelVariantsMap.get(this.model);
    if (modelVariants && modelVariants.length > 0) {
      this.variants = ['default', ...modelVariants];
    } else {
      this.variants = ['default'];
    }
    if (!this.variants.includes(this.variant)) {
      this.variant = 'default';
    }
  }

  private fetchProviderModels(provider: string) {
    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels,
        payload: { provider }
      })
      .pipe(
        tap((resp: ToBackendGetAgentProviderModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.modelVariantsMap.clear();
            let modelOptions = resp.payload.models.map(m => {
              let value = `${m.providerId}/${m.id}`;
              if (m.variants && m.variants.length > 0) {
                this.modelVariantsMap.set(value, m.variants);
              }
              return { value, label: m.id };
            });
            this.models = [
              { value: 'default', label: 'default' },
              ...modelOptions
            ];
            this.updateVariants();
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  private fetchModels(sessionId: string) {
    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetAgentSessionModels,
        payload: { sessionId }
      })
      .pipe(
        tap((resp: ToBackendGetAgentSessionModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.modelVariantsMap.clear();
            let modelOptions = resp.payload.models.map(m => {
              let value = `${m.providerId}/${m.id}`;
              if (m.variants && m.variants.length > 0) {
                this.modelVariantsMap.set(value, m.variants);
              }
              return { value, label: m.id };
            });
            this.models = [
              { value: 'default', label: 'default' },
              ...modelOptions
            ];
            this.updateVariants();
            this.cd.detectChanges();
          }
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
      this.sseRetryCount = 0;

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

    this.eventSource.onerror = () => {
      this.closeSse();

      if (this.sseRetryCount >= this.SSE_MAX_RETRIES) {
        return;
      }

      this.sseRetryCount++;

      setTimeout(() => {
        if (
          this.session?.sessionId === sessionId &&
          this.session?.status === SessionStatusEnum.Active
        ) {
          this.reconnectSse(sessionId);
        }
      }, this.SSE_RETRY_DELAY_MS);
    };
  }

  private reconnectSse(sessionId: string) {
    let payload: ToBackendGetAgentSessionRequestPayload = {
      sessionId: sessionId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetAgentSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.sessionQuery.update(resp.payload.session);

            if (resp.payload.events.length > 0) {
              this.sessionEventsQuery.updatePart({
                events: resp.payload.events
              });
            }

            this.connectSse(sessionId);
          }
        }),
        take(1)
      )
      .subscribe();
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
    if (lastMessage.sender === 'error') {
      return false;
    }
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

    // Track message roles by ID to distinguish user vs assistant parts
    let messageRoles = new Map<string, string>();
    // Track which message IDs already have a ChatMessage entry
    let seenMessageIds = new Set<string>();
    // Map message ID to its ChatMessage for updating text from parts
    let messageById = new Map<string, ChatMessage>();

    // Only process contiguous events (stop at first gap in eventIndex)
    let contiguousEvents: AgentEventApi[] = [];
    for (let i = 0; i < events.length; i++) {
      if (i > 0 && events[i].eventIndex !== events[i - 1].eventIndex + 1) {
        break;
      }
      contiguousEvents.push(events[i]);
    }

    for (let event of contiguousEvents) {
      let oc = event.ocEvent;
      if (!oc) {
        continue;
      }

      // Permission requests
      if ((oc.type as string) === 'permission.asked') {
        let props = (oc as any).properties;
        currentMessage = {
          sender: 'permission',
          text: props.permission || 'Permission requested',
          permissionId: props.id
        };
        messages.push(currentMessage);
        currentMessage = undefined;
        continue;
      }

      // message.updated: register role, create entry only on first occurrence
      if (oc.type === 'message.updated') {
        let info = oc.properties.info;
        let msgId = info.id;
        messageRoles.set(msgId, info.role);

        if (!seenMessageIds.has(msgId)) {
          seenMessageIds.add(msgId);

          if (info.role === 'user') {
            currentMessage = { sender: 'user', text: '' };
            messages.push(currentMessage);
            messageById.set(msgId, currentMessage);
          }
        }
        continue;
      }

      // message.part.updated events
      if (oc.type === 'message.part.updated') {
        let part = oc.properties.part;
        let parentMsgId = part.messageID;
        let parentRole = messageRoles.get(parentMsgId);

        // User message part: update the user message text
        if (parentRole === 'user') {
          if (part.type === 'text') {
            let userMsg = messageById.get(parentMsgId);
            if (userMsg) {
              userMsg.text = part.text || '';
            }
          }
          continue;
        }

        // Assistant message parts
        if (part.type === 'text') {
          let text = part.text || '';
          if (currentMessage && currentMessage.sender === 'agent') {
            currentMessage.text = text;
          } else {
            currentMessage = { sender: 'agent', text };
            messages.push(currentMessage);
          }
        } else if (part.type === 'tool') {
          let toolName = part.tool || 'tool';
          currentMessage = { sender: 'tool', text: toolName };
          messages.push(currentMessage);
          currentMessage = undefined;
        } else if (part.type === 'reasoning') {
          let text = part.text || '';
          if (currentMessage && currentMessage.sender === 'thought') {
            currentMessage.text = text;
          } else {
            currentMessage = { sender: 'thought', text };
            messages.push(currentMessage);
          }
        }
      }

      // Session error
      if ((oc.type as string) === 'session.error') {
        let props = (oc as any).properties;
        let errorMsg = props?.error?.data?.message || 'Session error';
        currentMessage = { sender: 'error', text: errorMsg };
        messages.push(currentMessage);
        currentMessage = undefined;
      }
    }

    return messages;
  }
}
