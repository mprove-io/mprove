import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import type {
  PermissionRequest,
  QuestionRequest,
  SessionStatus,
  ToolPart
} from '@opencode-ai/sdk/v2';
import { combineLatest, interval, Subscription } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { ArchivedReasonEnum } from '#common/enums/archived-reason.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { SessionApi } from '#common/interfaces/backend/session-api';
import {
  ToBackendCreateAgentSseTicketRequestPayload,
  ToBackendCreateAgentSseTicketResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-sse-ticket';
import {
  ToBackendGetAgentSessionRequestPayload,
  ToBackendGetAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import {
  ToBackendSendUserMessageToAgentRequestPayload,
  ToBackendSendUserMessageToAgentResponse
} from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';
import { groupPartsByMessageId } from '#front/app/functions/group-parts-by-message-id';
import { unwrapErrorMessage } from '#front/app/functions/unwrap-error-message';
import { AgentModelsQuery } from '#front/app/queries/agent-models.query';
import { SessionQuery } from '#front/app/queries/session.query';
import {
  SessionBundleQuery,
  SessionBundleState
} from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { EventReducerService } from '#front/app/services/event-reducer.service';
import { UiService } from '#front/app/services/ui.service';
import { environment } from '#front/environments/environment';
import { SessionInputComponent } from './session-input/session-input.component';

interface FileDiffInfo {
  file: string;
  additions: number;
  deletions: number;
  status?: 'added' | 'deleted' | 'modified';
  before?: string;
  after?: string;
}

interface ChatMessage {
  role: 'user' | 'agent' | 'tool' | 'thought' | 'error';
  text: string;
  toolPart?: ToolPart;
  agentName?: string;
  modelId?: string;
  variant?: string;
  summaryDiffs?: FileDiffInfo[];
}

interface ChatTurn {
  userMessage?: ChatMessage;
  responses: ChatMessage[];
  fileDiffs?: FileDiffInfo[];
}

@Component({
  standalone: false,
  selector: 'm-session',
  templateUrl: './session.component.html'
})
export class SessionComponent implements OnInit, OnDestroy {
  @ViewChild(SessionInputComponent) sessionInput: SessionInputComponent;

  archivedReasonEnum = ArchivedReasonEnum;
  model = 'default';
  agent = 'plan';
  variant = 'default';

  // Chat mode
  session: SessionApi;
  events: AgentEventApi[] = [];
  messages: ChatMessage[] = [];
  turns: ChatTurn[] = [];
  permissions: PermissionRequest[] = [];
  questions: QuestionRequest[] = [];
  scrollTrigger = 0;
  isSessionSwitching = false;
  showSessionMessages = true;
  previousTurnsCount = 0;
  previousLastTurnResponsesExist = false;
  previousSessionId: string;
  userSentMessage = false;
  isActivating = false;
  isArchived = false;
  archivedReason: string | undefined;
  isWaitingForResponse = false;
  isAgentBusy = false;
  isAborting = false;
  retryMessage: string;
  isSessionError = false;

  get statusText(): string {
    if (this.isWaitingForResponse) {
      return this.retryMessage ? 'Retrying' : 'Working';
    }
    return '';
  }

  get statusTooltip(): string {
    if (this.isWaitingForResponse && this.retryMessage) {
      return this.retryMessage;
    }
    return '';
  }

  statusTextChars: { char: string; index: number }[] = [];
  private cachedStatusText = '';

  updateStatusTextChars() {
    const text = this.statusText;
    if (text !== this.cachedStatusText) {
      this.cachedStatusText = text;
      if (!text) {
        this.statusTextChars = [];
      } else {
        this.statusTextChars = text.split('').map((char, i) => ({
          char: char === ' ' ? '\u00A0' : char,
          index: i
        }));
      }
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  debugMode = false;
  debugExpandedEvents: Record<string, boolean> = {};
  allEventsExpanded = false;
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

  private toggleAllEventsLastValue = 0;
  toggleAllEvents$ = this.uiQuery.sessionToggleAllEvents$.pipe(
    tap(x => {
      if (x !== this.toggleAllEventsLastValue) {
        this.toggleAllEventsLastValue = x;
        this.toggleAllEvents();
      }
    })
  );

  sessionAndData$ = combineLatest([
    this.sessionQuery.select(),
    this.sessionBundleQuery.select()
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

  ngOnInit() {}

  constructor(
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private sessionQuery: SessionQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private agentModelsQuery: AgentModelsQuery,
    private eventReducerService: EventReducerService
  ) {}

  ngOnDestroy() {
    this.closeSse();
    this.stopPolling();
  }

  toggleAllEvents() {
    this.allEventsExpanded = !this.allEventsExpanded;
    let expanded: Record<string, boolean> = {};
    if (this.allEventsExpanded) {
      for (let event of this.events) {
        expanded[event.eventId] = true;
      }
    }
    this.debugExpandedEvents = expanded;
    this.uiQuery.updatePart({
      sessionAllEventsExpanded: this.allEventsExpanded
    });
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

    this.sendInteraction({
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Message,
      message: text,
      model: this.model,
      variant: this.variant !== 'default' ? this.variant : undefined
    });
  }

  abortSession() {
    if (!this.session) {
      return;
    }

    this.isAborting = true;
    this.isAgentBusy = false;
    this.cd.detectChanges();

    this.sendInteraction({
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Abort
    });
  }

  respondToPermission(event: { permissionId: string; reply: string }) {
    if (!this.session) {
      return;
    }

    // Optimistic: remove permission from store
    let currentState = this.sessionBundleQuery.getValue();
    this.sessionBundleQuery.updatePart({
      permissions: currentState.permissions.filter(
        p => p.id !== event.permissionId
      )
    });

    this.sendInteraction({
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Permission,
      permissionId: event.permissionId,
      reply: event.reply
    });
  }

  respondToQuestion(event: { questionId: string; answers: string[][] }) {
    if (!this.session) {
      return;
    }

    // Optimistic: remove question from store
    let currentState = this.sessionBundleQuery.getValue();
    this.sessionBundleQuery.updatePart({
      questions: currentState.questions.filter(q => q.id !== event.questionId)
    });

    this.sendInteraction({
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Question,
      questionId: event.questionId,
      answers: event.answers
    });
  }

  rejectQuestion(event: { questionId: string }) {
    if (!this.session) {
      return;
    }

    // Optimistic: remove question from store
    let currentState = this.sessionBundleQuery.getValue();
    this.sessionBundleQuery.updatePart({
      questions: currentState.questions.filter(q => q.id !== event.questionId)
    });

    this.sendInteraction({
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Question,
      questionId: event.questionId
    });
  }

  sendInteraction(payload: ToBackendSendUserMessageToAgentRequestPayload) {
    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSendUserMessageToAgentResponse) => {
          let session = resp?.payload?.session;
          if (session) {
            this.sessionQuery.update(session);

            let sessionId = this.session?.sessionId;
            if (sessionId) {
              let sessions = this.sessionsQuery.getValue().sessions;
              let updated = sessions.map(s =>
                s.sessionId === sessionId ? session : s
              );
              this.sessionsQuery.updatePart({ sessions: updated });
            }
          }
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

            let sdkSessionStatus: SessionStatus;
            for (let e of resp.payload.events) {
              if (e.ocEvent?.type === 'session.status') {
                sdkSessionStatus = e.ocEvent.properties.status;
              }
            }

            this.sessionBundleQuery.updatePart({
              messages: resp.payload.messages || [],
              parts: resp.payload.parts
                ? groupPartsByMessageId(resp.payload.parts)
                : {},
              todos: resp.payload.ocSession?.todos ?? [],
              questions: resp.payload.ocSession?.questions ?? [],
              permissions: resp.payload.ocSession?.permissions ?? [],
              sdkSessionStatus
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
    if (!this.session?.sessionId || this.session.sessionId !== sessionId) {
      return;
    }
    this.closeSse();

    let url =
      environment.httpUrl +
      `/api/sse/agent-events?sessionId=${sessionId}&ticket=${sseTicket}&lastEventIndex=${this.lastProcessedEventIndex}`;

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

            let sdkSessionStatus: SessionStatus;
            for (let e of resp.payload.events) {
              if (e.ocEvent?.type === 'session.status') {
                sdkSessionStatus = e.ocEvent.properties.status;
              }
            }

            this.sessionBundleQuery.updatePart({
              messages: resp.payload.messages || [],
              parts: resp.payload.parts
                ? groupPartsByMessageId(resp.payload.parts)
                : {},
              todos: resp.payload.ocSession?.todos ?? [],
              questions: resp.payload.ocSession?.questions ?? [],
              permissions: resp.payload.ocSession?.permissions ?? [],
              sdkSessionStatus
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

  enterSession(sessionData: SessionBundleState) {
    // Destroy session-messages to reset scroll state
    this.isSessionSwitching = true;
    this.cd.detectChanges();

    this.agent = this.session.agent;
    this.model =
      this.session.lastMessageProviderModel || this.session.model || 'default';
    this.sseRetryCount = 0;
    this.lastProcessedEventIndex = -1;
    this.isAborting = false;
    this.pendingUserMessages = [];
    this.lastKnownStoreUserCount = sessionData.messages.filter(
      m => m.role === 'user'
    ).length;
    let savedVariant = this.session.lastMessageVariant || 'default';
    this.variant = savedVariant;

    if (this.sessionInput) {
      this.sessionInput.applyModels(this.agentModelsQuery.getValue().models);
    }

    this.permissions = sessionData.permissions || [];
    this.questions = sessionData.questions || [];

    this.messages = this.buildMessagesFromStores(
      sessionData.messages,
      sessionData.parts
    );
    this.turns = this.buildTurns(this.messages);

    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isArchived = this.session.status === SessionStatusEnum.Archived;
    this.archivedReason = this.session.archivedReason;
    this.isWaitingForResponse = this.checkIsWaitingForResponse(
      sessionData.sdkSessionStatus
    );
    this.isAgentBusy = this.checkIsAgentBusy(sessionData.sdkSessionStatus);
    this.retryMessage = this.getRetryMessage(sessionData.sdkSessionStatus);
    this.isSessionError = this.session.status === SessionStatusEnum.Error;

    this.updateStatusTextChars();

    this.previousTurnsCount = this.turns.length;
    this.previousLastTurnResponsesExist =
      this.turns[this.turns.length - 1]?.responses?.length > 0;

    // Recreate session-messages — ngAfterViewInit will scroll to bottom
    this.isSessionSwitching = false;
    if (this.showSessionMessages) {
      this.managePollingAndSse();
    }
  }

  updateSessionData(sessionData: SessionBundleState) {
    // Propagate title from SSE session.updated event
    if (
      sessionData.sessionTitle &&
      sessionData.sessionTitle !== this.session?.title
    ) {
      this.session = { ...this.session, title: sessionData.sessionTitle };

      let sessions = this.sessionsQuery.getValue().sessions;
      let updated = sessions.map(s =>
        s.sessionId === this.session.sessionId
          ? { ...s, title: sessionData.sessionTitle }
          : s
      );
      this.sessionsQuery.updatePart({ sessions: updated });
    }

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

    this.permissions = sessionData.permissions || [];
    this.questions = sessionData.questions || [];

    this.messages = this.buildMessagesFromStores(
      sessionData.messages,
      sessionData.parts
    );
    this.turns = this.buildTurns(this.messages);

    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isArchived = this.session.status === SessionStatusEnum.Archived;
    this.archivedReason = this.session.archivedReason;
    this.isWaitingForResponse =
      this.questions.length === 0 &&
      this.permissions.length === 0 &&
      (this.pendingUserMessages.length > 0 ||
        this.checkIsWaitingForResponse(sessionData.sdkSessionStatus));
    this.isAgentBusy = this.checkIsAgentBusy(sessionData.sdkSessionStatus);
    this.retryMessage = this.getRetryMessage(sessionData.sdkSessionStatus);
    this.isSessionError = this.session.status === SessionStatusEnum.Error;

    this.updateStatusTextChars();

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
      let result = sdkSessionStatus.type !== 'idle';
      return result;
    }
    if (this.messages.length === 0) {
      return true;
    }
    let lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage.role === 'error') {
      return false;
    }
    let result = lastMessage.role === 'user' || lastMessage.role === 'tool';
    return result;
  }

  checkIsAgentBusy(sdkSessionStatus: SessionStatus): boolean {
    if (this.session?.status !== SessionStatusEnum.Active) {
      return false;
    }
    if (sdkSessionStatus) {
      let busy = sdkSessionStatus.type !== 'idle';
      if (!busy) {
        this.isAborting = false;
      }
      if (this.isAborting) {
        return false;
      }
      return busy;
    }
    if (this.messages.length === 0) {
      return false;
    }
    let lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage.role === 'error') {
      return false;
    }
    return lastMessage.role === 'user' || lastMessage.role === 'tool';
  }

  getRetryMessage(sdkSessionStatus: SessionStatus): string {
    if (sdkSessionStatus?.type === 'retry') {
      return `Retrying (attempt ${sdkSessionStatus.attempt}): ${sdkSessionStatus.message}`;
    }
    return undefined;
  }

  rebuildMessagesAndTurns() {
    let data = this.sessionBundleQuery.getValue();
    this.messages = this.buildMessagesFromStores(data.messages, data.parts);
    this.turns = this.buildTurns(this.messages);
  }

  buildTurns(messages: ChatMessage[]): ChatTurn[] {
    let turns: ChatTurn[] = [];
    let currentTurn: ChatTurn | undefined;

    for (let msg of messages) {
      if (msg.role === 'user') {
        currentTurn = {
          userMessage: msg,
          responses: [],
          fileDiffs: msg.summaryDiffs?.length > 0 ? msg.summaryDiffs : undefined
        };
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
    storeParts: { [messageId: string]: AgentPartApi[] }
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

        // Extract metadata from ocMessage (UserMessage type)
        let userOcMsg = msg.ocMessage as any;
        let agentName = userOcMsg?.agent || '';
        let modelId = userOcMsg?.model?.modelID || '';
        let variant = userOcMsg?.variant || '';

        // Extract summary diffs
        let summaryDiffs: FileDiffInfo[] | undefined;
        let rawDiffs = userOcMsg?.summary?.diffs;
        if (Array.isArray(rawDiffs) && rawDiffs.length > 0) {
          let seen = new Set<string>();
          let deduped: FileDiffInfo[] = [];
          for (let i = rawDiffs.length - 1; i >= 0; i--) {
            let d = rawDiffs[i];
            if (!seen.has(d.file)) {
              seen.add(d.file);
              deduped.push({
                file: d.file,
                additions: d.additions,
                deletions: d.deletions,
                status: d.status,
                before: d.before ?? '',
                after: d.after ?? ''
              });
            }
          }
          summaryDiffs = deduped.reverse();
        }

        chatMessages.push({
          role: 'user',
          text,
          agentName,
          modelId,
          variant,
          summaryDiffs
        });
      } else {
        // Assistant message - process each part
        let partCount = 0;
        for (let partApi of parts) {
          let part = partApi.ocPart;
          if (!part) continue;

          if (part.type === 'text') {
            chatMessages.push({
              role: 'agent',
              text: part.text || ''
            });
            partCount++;
          } else if (part.type === 'tool') {
            chatMessages.push({
              role: 'tool',
              text: part.tool || 'tool',
              toolPart: part as ToolPart
            });
            partCount++;
          } else if (part.type === 'reasoning') {
            chatMessages.push({
              role: 'thought',
              text: part.text || ''
            });
            partCount++;
          }
        }

        // Show error if assistant message has no visible parts but has an error
        if (partCount === 0) {
          let error = (msg.ocMessage as any)?.error;
          if (error && error.name !== 'MessageAbortedError') {
            let errorText = unwrapErrorMessage(error.data?.message ?? '');
            chatMessages.push({ role: 'error', text: errorText });
          }
        }
      }
    }

    // If no messages yet but session has firstMessage, show it
    if (chatMessages.length === 0 && this.session?.firstMessage) {
      let firstModelId =
        this.model !== 'default' && this.model.includes('/')
          ? this.model.substring(this.model.indexOf('/') + 1)
          : this.model;
      chatMessages.push({
        role: 'user',
        text: this.session.firstMessage,
        agentName: this.agent,
        modelId: firstModelId,
        variant: this.variant !== 'default' ? this.variant : ''
      });
    }

    // Append pending optimistic user messages
    let optimisticModelId =
      this.model !== 'default' && this.model.includes('/')
        ? this.model.substring(this.model.indexOf('/') + 1)
        : this.model;
    for (let text of this.pendingUserMessages) {
      chatMessages.push({
        role: 'user',
        text,
        agentName: this.agent,
        modelId: optimisticModelId,
        variant: this.variant !== 'default' ? this.variant : ''
      });
    }

    return chatMessages;
  }
}
