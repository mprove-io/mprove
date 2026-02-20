import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { combineLatest, interval, Subscription } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  AgentEventApi,
  type PermissionRequest,
  type QuestionRequest,
  type SessionStatus
} from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
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
import { ToBackendRejectAgentQuestionRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-reject-agent-question';
import { ToBackendRespondToAgentPermissionRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-respond-to-agent-permission';
import { ToBackendRespondToAgentQuestionRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-respond-to-agent-question';
import { ToBackendSendAgentMessageRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-send-agent-message';
import { groupPartsByMessageId } from '#front/app/functions/group-parts-by-message-id';
import { AgentModelsQuery } from '#front/app/queries/agent-models.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { SessionQuery } from '#front/app/queries/session.query';
import {
  SessionDataQuery,
  SessionDataState
} from '#front/app/queries/session-data.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { EventReducerService } from '#front/app/services/event-reducer.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';
import { environment } from '#front/environments/environment';

interface ChatMessage {
  sender: string;
  text: string;
  permissionId?: string;
  questionId?: string;
  question?: QuestionRequest;
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

  model = 'default';
  agent = 'plan';
  variant = 'default';

  models: {
    value: string;
    label: string;
    modelId: string;
    providerName: string;
  }[] = [
    { value: 'default', label: 'default', modelId: 'default', providerName: '' }
  ];
  modelsLoading = false;
  agents = ['build', 'plan'];
  variants: string[] = ['default'];
  modelVariantsMap = new Map<string, string[]>();
  providerHasApiKey = true;

  // Chat mode
  session: AgentSessionApi;
  events: AgentEventApi[] = [];
  messages: ChatMessage[] = [];
  turns: ChatTurn[] = [];
  scrollTrigger = 0;
  showSessionMessages = true;
  previousTurnsCount = 0;
  previousLastTurnResponsesExist = false;
  previousSessionId: string;
  userSentMessage = false;
  isChatMode = false;
  isActivating = false;
  isWaitingForResponse = false;
  isSessionError = false;
  debugMode = false;
  eventSource: EventSource;
  isConnectingSse = false;
  sseRetryCount = 0;
  SSE_MAX_RETRIES = 5;
  SSE_RETRY_DELAY_MS = 3000;
  lastProcessedEventIndex = -1;

  // SSE event batching
  sseEventBuffer: AgentEventApi[] = [];
  sseRafId: number;

  // Polling
  pollSubscription: Subscription;

  debugEvents$ = this.sessionEventsQuery.events$.pipe(
    tap(x => {
      this.events = x;
      this.cd.detectChanges();
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

  sessionAndData$ = combineLatest([
    this.sessionQuery.select(),
    this.sessionDataQuery.select()
  ]).pipe(
    tap(([session, sessionData]) => {
      let currentSessionId = session?.sessionId;
      let hasSession = !!currentSessionId;
      let hadPrevSession = !!this.previousSessionId;

      this.session = session;

      if (!hasSession && !hadPrevSession) {
        // 1) No session, no prev session — initial/idle
        this.isChatMode = false;
      } else if (!hasSession && hadPrevSession) {
        // 2) Session deselected — had session, now none
        this.closeSse();
        this.stopPolling();
        this.isChatMode = false;
        this.messageText = '';
        this.isSubmitting = false;
      } else if (
        hasSession &&
        hadPrevSession &&
        currentSessionId !== this.previousSessionId
      ) {
        // 3) Session changed — switching from one to another
        this.closeSse();
        this.stopPolling();
        this.enterSession(sessionData);
      } else if (hasSession && !hadPrevSession) {
        // 4) Session selected — from no session to session
        this.enterSession(sessionData);
      } else {
        // 5) Same session — data update (streaming/polling)
        this.updateSessionData(sessionData);
      }

      this.previousSessionId = currentSessionId;
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
    private sessionDataQuery: SessionDataQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private uiService: UiService,
    private agentlsQuery: AgentModelsQuery,
    private eventReducerService: EventReducerService
  ) {
    this.model = this.uiQuery.getValue().lastSelectedProviderModel || 'default';
    this.applyModels(this.agentlsQuery.getValue().models);
    let savedVariant = this.uiQuery.getValue().lastSelectedVariant || 'default';
    if (this.variants.includes(savedVariant)) {
      this.variant = savedVariant;
    }
    this.updateProviderHasApiKey();
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

  getProviderFromModel(): string {
    if (this.model === 'default') {
      return 'opencode';
    }
    return this.model.split('/')[0];
  }

  sendMessage() {
    if (!this.messageText.trim() || this.isSubmitting) {
      return;
    }

    this.userSentMessage = true;
    this.isSubmitting = true;

    let nav = this.navQuery.getValue();
    let firstMessageText = this.messageText.trim();
    let provider = this.getProviderFromModel();

    this.messageText = '';

    this.uiQuery.updatePart({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });
    this.uiService.setUserUi({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });

    let payload: ToBackendCreateAgentSessionRequestPayload = {
      projectId: nav.projectId,
      sandboxType: SandboxTypeEnum.E2B,
      provider: provider,
      model: this.model,
      agent: this.agent,
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
              provider: provider,
              agent: this.agent,
              model: this.model,
              lastMessageProviderModel: this.model,
              lastMessageVariant:
                this.variant !== 'default' ? this.variant : undefined,
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

    this.uiQuery.updatePart({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });
    this.uiService.setUserUi({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });

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

  respondToQuestion(event: { questionId: string; answers: string[][] }) {
    if (!this.session) {
      return;
    }

    let payload: ToBackendRespondToAgentQuestionRequestPayload = {
      sessionId: this.session.sessionId,
      questionId: event.questionId,
      answers: event.answers
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendRespondToAgentQuestion,
        payload: payload
      })
      .pipe(take(1))
      .subscribe();
  }

  rejectQuestion(event: { questionId: string }) {
    if (!this.session) {
      return;
    }

    let payload: ToBackendRejectAgentQuestionRequestPayload = {
      sessionId: this.session.sessionId,
      questionId: event.questionId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRejectAgentQuestion,
        payload: payload
      })
      .pipe(take(1))
      .subscribe();
  }

  agentsSearchFn(term: string, agent: string) {
    let haystack = [`${agent}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  modelsSearchFn(
    term: string,
    model: { label: string; modelId: string; providerName: string }
  ) {
    let haystack = [`${model.modelId} ${model.providerName}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  variantsSearchFn(term: string, variant: string) {
    let haystack = [`${variant}`];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  onModelChange() {
    this.updateVariants();
    this.updateProviderHasApiKey();
    this.uiQuery.updatePart({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });
    this.uiService.setUserUi({
      lastSelectedProviderModel: this.model,
      lastSelectedVariant: this.variant
    });
  }

  onVariantChange() {
    this.uiQuery.updatePart({
      lastSelectedVariant: this.variant
    });
    this.uiService.setUserUi({
      lastSelectedVariant: this.variant
    });
  }

  updateProviderHasApiKey() {
    let provider = this.getProviderFromModel();
    let project = this.projectQuery.getValue();
    if (provider === 'opencode') {
      this.providerHasApiKey = !!project.isZenApiKeySet;
    } else if (provider === 'openai') {
      this.providerHasApiKey = !!project.isOpenaiApiKeySet;
    } else if (provider === 'anthropic') {
      this.providerHasApiKey = !!project.isAnthropicApiKeySet;
    } else {
      this.providerHasApiKey = false;
    }
  }

  updateVariants() {
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

  applyModels(
    apiModels: {
      id: string;
      providerId: string;
      providerName: string;
      variants?: string[];
    }[]
  ) {
    this.modelVariantsMap.clear();
    let modelOptions = apiModels.map(m => {
      let value = `${m.providerId}/${m.id}`;
      if (m.variants && m.variants.length > 0) {
        this.modelVariantsMap.set(value, m.variants);
      }
      return {
        value,
        label: `${m.id}`,
        modelId: m.id,
        providerName: m.providerName
      };
    });
    this.models = [
      {
        value: 'default',
        label: 'default',
        modelId: 'default',
        providerName: ''
      },
      ...modelOptions
    ];
    this.updateVariants();
  }

  openModelSelect() {
    this.modelsLoading = true;

    let payload: { sessionId?: string } = {};
    if (this.session?.sessionId) {
      payload.sessionId = this.session.sessionId;
    }

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetAgentProviderModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.agentlsQuery.update({ models: resp.payload.models });
            this.applyModels(resp.payload.models);
          }
          this.modelsLoading = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  startPolling(sessionId: string) {
    this.pollSubscription = interval(1000)
      .pipe(
        switchMap(() =>
          this.apiService.req({
            pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
            payload: {
              sessionId: sessionId,
              includeMessagesAndParts: true
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

            this.sessionDataQuery.updatePart({
              messages: resp.payload.messages || [],
              parts: resp.payload.parts
                ? groupPartsByMessageId(resp.payload.parts)
                : {}
            });

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

  stopPolling() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  connectSse(sessionId: string) {
    if (this.isConnectingSse || this.eventSource) {
      return;
    }

    this.isConnectingSse = true;

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
          this.isConnectingSse = false;
        }),
        take(1)
      )
      .subscribe();
  }

  connectSseWithTicket(sessionId: string, sseTicket: string) {
    this.closeSse();

    let url =
      environment.httpUrl +
      `/api/sse/agent-events?sessionId=${sessionId}&ticket=${sseTicket}`;

    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('agent-event', (event: MessageEvent) => {
      this.sseRetryCount = 0;

      let agentEvent: AgentEventApi = JSON.parse(event.data);

      // Deduplicate by eventIndex (O(1) check)
      if (agentEvent.eventIndex <= this.lastProcessedEventIndex) {
        return;
      }

      this.sseEventBuffer.push(agentEvent);

      if (this.sseRafId === undefined) {
        this.sseRafId = requestAnimationFrame(() => {
          this.flushSseBuffer();
        });
      }
    });

    this.eventSource.onerror = () => {
      this.closeSse();

      if (this.sseRetryCount >= this.SSE_MAX_RETRIES) {
        return;
      }

      this.sseRetryCount++;

      // Prevent sessionAndData$ from triggering connectSse during retry delay
      this.isConnectingSse = true;

      setTimeout(() => {
        if (
          this.session?.sessionId === sessionId &&
          this.session?.status === SessionStatusEnum.Active
        ) {
          this.reconnectSse(sessionId);
        } else {
          this.isConnectingSse = false;
        }
      }, this.SSE_RETRY_DELAY_MS);
    };
  }

  reconnectSse(sessionId: string) {
    // Guard to prevent sessionAndData$ from triggering connectSse during store updates
    this.isConnectingSse = true;

    let payload: ToBackendGetAgentSessionRequestPayload = {
      sessionId: sessionId,
      includeMessagesAndParts: true
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

              // Update lastProcessedEventIndex from fetched events
              let maxIndex = resp.payload.events.reduce(
                (max, e) => Math.max(max, e.eventIndex),
                -1
              );
              this.lastProcessedEventIndex = maxIndex;
            }

            this.sessionDataQuery.updatePart({
              messages: resp.payload.messages || [],
              parts: resp.payload.parts
                ? groupPartsByMessageId(resp.payload.parts)
                : {}
            });

            // Release the guard, then connect SSE directly
            this.isConnectingSse = false;
            this.connectSse(sessionId);
          } else {
            this.isConnectingSse = false;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  flushSseBuffer() {
    if (this.sseRafId !== undefined) {
      cancelAnimationFrame(this.sseRafId);
      this.sseRafId = undefined;
    }

    let buffer = this.sseEventBuffer;
    if (buffer.length === 0) return;
    this.sseEventBuffer = [];

    // Batch debug events store update
    let currentEvents = this.sessionEventsQuery.getValue().events;
    let updatedEvents = [...currentEvents, ...buffer].sort(
      (a, b) => a.eventIndex - b.eventIndex
    );
    this.sessionEventsQuery.updatePart({ events: updatedEvents });

    // Batch reducer events
    let ocEvents = buffer.filter(e => e.ocEvent).map(e => e.ocEvent);

    if (ocEvents.length > 0) {
      this.eventReducerService.applyEvents(ocEvents);
    }

    // Update lastProcessedEventIndex from batch
    let maxIndex = buffer.reduce(
      (max, e) => Math.max(max, e.eventIndex),
      this.lastProcessedEventIndex
    );
    this.lastProcessedEventIndex = maxIndex;
  }

  enterSession(sessionData: SessionDataState) {
    this.agent = this.session.agent;
    this.model =
      this.session.lastMessageProviderModel || this.session.model || 'default';
    this.sseRetryCount = 0;
    this.lastProcessedEventIndex = -1;
    this.applyModels(this.agentlsQuery.getValue().models);
    let savedVariant = this.session.lastMessageVariant || 'default';
    this.variant = this.variants.includes(savedVariant)
      ? savedVariant
      : 'default';
    this.updateProviderHasApiKey();

    this.messages = this.buildMessagesFromStores(
      sessionData.messages,
      sessionData.parts,
      sessionData.permissions,
      sessionData.questions
    );
    this.turns = this.buildTurns(this.messages);

    this.isChatMode = true;
    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isWaitingForResponse = this.checkIsWaitingForResponse(
      sessionData.sdkSessionStatus
    );
    this.isSessionError = this.session.status === SessionStatusEnum.Error;

    this.messageText = '';
    this.isSubmitting = false;
    this.previousTurnsCount = this.turns.length;
    this.previousLastTurnResponsesExist =
      this.turns[this.turns.length - 1]?.responses?.length > 0;

    if (!this.showSessionMessages) {
      this.uiQuery.updatePart({ showSessionMessages: true });
    }

    this.managePollingAndSse();
  }

  updateSessionData(sessionData: SessionDataState) {
    this.messages = this.buildMessagesFromStores(
      sessionData.messages,
      sessionData.parts,
      sessionData.permissions,
      sessionData.questions
    );
    this.turns = this.buildTurns(this.messages);

    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isWaitingForResponse = this.checkIsWaitingForResponse(
      sessionData.sdkSessionStatus
    );
    this.isSessionError = this.session.status === SessionStatusEnum.Error;

    if (!this.showSessionMessages) {
      this.uiQuery.updatePart({ showSessionMessages: true });
    }

    this.managePollingAndSse();

    let shouldScroll = false;

    if (this.userSentMessage && this.turns.length > this.previousTurnsCount) {
      shouldScroll = true;
      this.userSentMessage = false;
    }

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
  }

  managePollingAndSse() {
    if (
      this.session.status === SessionStatusEnum.New &&
      !this.pollSubscription
    ) {
      this.startPolling(this.session.sessionId);
    }

    if (
      this.session.status !== SessionStatusEnum.New &&
      this.pollSubscription
    ) {
      this.stopPolling();
    }

    if (
      this.session.status === SessionStatusEnum.Active &&
      !this.eventSource &&
      !this.isConnectingSse
    ) {
      this.connectSse(this.session.sessionId);
    }
  }

  closeSse() {
    this.flushSseBuffer();
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    this.isConnectingSse = false;
  }

  checkIsWaitingForResponse(sdkSessionStatus: SessionStatus): boolean {
    if (this.session?.status !== SessionStatusEnum.Active) {
      return false;
    }
    if (sdkSessionStatus) {
      return sdkSessionStatus.type === 'busy';
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

  buildTurns(messages: ChatMessage[]): ChatTurn[] {
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

  buildMessagesFromStores(
    storeMessages: AgentMessageApi[],
    storeParts: { [messageId: string]: AgentPartApi[] },
    permissions: PermissionRequest[],
    questions: QuestionRequest[]
  ): ChatMessage[] {
    let chatMessages: ChatMessage[] = [];

    for (let msg of storeMessages) {
      let messageId = msg.messageId;
      let role = msg.role;
      let parts = storeParts[messageId] || [];

      if (role === 'user') {
        let found = parts.find(p => p.ocPart?.type === 'text')?.ocPart;
        let text = found?.type === 'text' ? found.text || '' : '';

        // Fallback to session.firstMessage for first user message
        if (!text && this.session?.firstMessage) {
          let isFirst =
            storeMessages.indexOf(msg) === 0 ||
            storeMessages.filter(m => m.role === 'user').indexOf(msg) === 0;
          if (isFirst) {
            text = this.session.firstMessage;
          }
        }

        chatMessages.push({ sender: 'user', text });
      } else {
        // Assistant message - process each part
        for (let partApi of parts) {
          let part = partApi.ocPart;
          if (!part) continue;

          if (part.type === 'text') {
            chatMessages.push({
              sender: 'agent',
              text: part.text || ''
            });
          } else if (part.type === 'tool') {
            chatMessages.push({
              sender: 'tool',
              text: part.tool || 'tool'
            });
          } else if (part.type === 'reasoning') {
            chatMessages.push({
              sender: 'thought',
              text: part.text || ''
            });
          }
        }
      }
    }

    // If no messages yet but session has firstMessage, show it
    if (chatMessages.length === 0 && this.session?.firstMessage) {
      chatMessages.push({
        sender: 'user',
        text: this.session.firstMessage
      });
    }

    // Append active permissions
    for (let perm of permissions) {
      chatMessages.push({
        sender: 'permission',
        text: perm.permission || 'Permission requested',
        permissionId: perm.id
      });
    }

    // Append active questions
    for (let q of questions) {
      chatMessages.push({
        sender: 'question',
        text: q.questions?.[0]?.question || 'Question asked',
        questionId: q.id,
        question: q
      });
    }

    return chatMessages;
  }
}
