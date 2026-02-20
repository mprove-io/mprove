import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { combineLatest, interval, Subscription } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
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
  ToBackendCreateAgentSseTicketRequestPayload,
  ToBackendCreateAgentSseTicketResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-sse-ticket';
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
import { UiService } from '#front/app/services/ui.service';
import { environment } from '#front/environments/environment';
import { SessionInputComponent } from './session-input/session-input.component';

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
  @ViewChild(SessionInputComponent) sessionInput: SessionInputComponent;

  model = 'default';
  agent = 'plan';
  variant = 'default';

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

  // Optimistic
  pendingUserMessages: string[] = [];
  lastKnownStoreUserCount = 0;

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

      if (!hasSession) {
        // No session in store yet (resolver hasn't completed)
        return;
      } else if (
        hasSession &&
        hadPrevSession &&
        currentSessionId !== this.previousSessionId
      ) {
        // Session changed — switching from one to another
        this.closeSse();
        this.stopPolling();
        this.enterSession(sessionData);
      } else if (hasSession && !hadPrevSession) {
        // Session selected — first load
        this.enterSession(sessionData);
      } else {
        // Same session — data update (streaming/polling)
        this.updateSessionData(sessionData);
      }

      this.previousSessionId = currentSessionId;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private sessionQuery: SessionQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private sessionDataQuery: SessionDataQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private agentModelsQuery: AgentModelsQuery,
    private eventReducerService: EventReducerService
  ) {}

  ngOnDestroy() {
    this.closeSse();
    this.stopPolling();
  }

  getProviderFromModel(): string {
    if (this.model === 'default') {
      return 'opencode';
    }
    return this.model.split('/')[0];
  }

  sendFollowUp(text: string) {
    if (!this.session) {
      return;
    }

    this.userSentMessage = true;

    // Optimistic: show user message immediately
    this.pendingUserMessages.push(text);
    this.rebuildMessagesAndTurns();
    this.isWaitingForResponse = true;
    this.scrollTrigger++;
    this.cd.detectChanges();

    let payload: ToBackendSendAgentMessageRequestPayload = {
      sessionId: this.session.sessionId,
      message: text,
      model: this.model,
      variant: this.variant !== 'default' ? this.variant : undefined
    };

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

    // Optimistic: remove permission from store
    let currentState = this.sessionDataQuery.getValue();
    this.sessionDataQuery.updatePart({
      permissions: currentState.permissions.filter(
        p => p.id !== event.permissionId
      )
    });

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

    // Optimistic: remove question from store
    let currentState = this.sessionDataQuery.getValue();
    this.sessionDataQuery.updatePart({
      questions: currentState.questions.filter(q => q.id !== event.questionId)
    });

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

    // Optimistic: remove question from store
    let currentState = this.sessionDataQuery.getValue();
    this.sessionDataQuery.updatePart({
      questions: currentState.questions.filter(q => q.id !== event.questionId)
    });

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
    this.pendingUserMessages = [];
    this.lastKnownStoreUserCount = sessionData.messages.filter(
      m => m.role === 'user'
    ).length;
    let savedVariant = this.session.lastMessageVariant || 'default';
    this.variant = savedVariant;

    if (this.sessionInput) {
      this.sessionInput.applyModels(this.agentModelsQuery.getValue().models);
    }

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

    this.previousTurnsCount = this.turns.length;
    this.previousLastTurnResponsesExist =
      this.turns[this.turns.length - 1]?.responses?.length > 0;

    if (!this.showSessionMessages) {
      this.uiQuery.updatePart({ showSessionMessages: true });
    }

    this.managePollingAndSse();
  }

  updateSessionData(sessionData: SessionDataState) {
    // Cleanup confirmed optimistic messages
    let storeUserCount = sessionData.messages.filter(
      m => m.role === 'user'
    ).length;
    let newUsers = storeUserCount - this.lastKnownStoreUserCount;
    if (newUsers > 0 && this.pendingUserMessages.length > 0) {
      this.pendingUserMessages.splice(
        0,
        Math.min(newUsers, this.pendingUserMessages.length)
      );
    }
    this.lastKnownStoreUserCount = storeUserCount;

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
      let result = sdkSessionStatus.type === 'busy';
      return result;
    }
    if (this.messages.length === 0) {
      return true;
    }
    let lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage.sender === 'error') {
      return false;
    }
    let result = lastMessage.sender === 'user' || lastMessage.sender === 'tool';
    return result;
  }

  rebuildMessagesAndTurns() {
    let data = this.sessionDataQuery.getValue();
    this.messages = this.buildMessagesFromStores(
      data.messages,
      data.parts,
      data.permissions,
      data.questions
    );
    this.turns = this.buildTurns(this.messages);
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

    // Append pending optimistic user messages
    for (let text of this.pendingUserMessages) {
      chatMessages.push({ sender: 'user', text });
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
