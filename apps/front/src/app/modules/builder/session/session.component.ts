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
import { combineLatest, EMPTY, interval, Subscription } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
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
import { ToBackendPauseAgentSessionRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-pause-agent-session';
import { ToBackendSendUserMessageToAgentRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';
import { groupPartsByMessageId } from '#front/app/functions/group-parts-by-message-id';
import { makeTitle } from '#front/app/functions/make-title';
import { unwrapErrorMessage } from '#front/app/functions/unwrap-error-message';
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
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';
import { environment } from '#front/environments/environment';
import { SessionInputComponent } from './session-input/session-input.component';

interface ChatMessage {
  role: 'user' | 'agent' | 'tool' | 'thought' | 'error';
  text: string;
  toolPart?: ToolPart;
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
export class SessionComponent implements OnInit, OnDestroy {
  @ViewChild(SessionInputComponent) sessionInput: SessionInputComponent;

  model = 'default';
  agent = 'plan';
  variant = 'default';

  // Chat mode
  session: AgentSessionApi;
  sessionTitle = '';
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
  isWaitingForResponse = false;
  retryMessage: string;
  isSessionError = false;
  autoScroll = false;
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
      this.sessionTitle = this.session ? makeTitle(this.session) : '';
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
    private sessionDataQuery: SessionDataQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private agentModelsQuery: AgentModelsQuery,
    private eventReducerService: EventReducerService,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService
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
  }

  copyEventsJson() {
    const json = JSON.stringify(this.events, undefined, 2);
    navigator.clipboard.writeText(json);
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

    let wasPaused = this.session.status === SessionStatusEnum.Paused;

    this.userSentMessage = true;

    // Optimistic: show user message immediately
    this.pendingUserMessages.push(text);
    this.rebuildMessagesAndTurns();
    this.isWaitingForResponse = true;
    this.scrollTrigger++;
    this.cd.detectChanges();

    let payload: ToBackendSendUserMessageToAgentRequestPayload = {
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Message,
      message: text,
      model: this.model,
      variant: this.variant !== 'default' ? this.variant : undefined
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        payload: payload
      })
      .pipe(
        tap(() => {
          if (wasPaused) {
            this.sessionQuery.update({
              ...this.session,
              status: SessionStatusEnum.Active
            });

            let sessions = this.sessionsQuery.getValue().sessions;
            let updated = sessions.map(s =>
              s.sessionId === this.session.sessionId
                ? { ...s, status: SessionStatusEnum.Active }
                : s
            );
            this.sessionsQuery.updatePart({ sessions: updated });
          }
        }),
        catchError(() => {
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  respondToPermission(event: { permissionId: string; reply: string }) {
    if (!this.session) {
      return;
    }

    let wasPaused = this.session.status === SessionStatusEnum.Paused;

    // Optimistic: remove permission from store
    let currentState = this.sessionDataQuery.getValue();
    this.sessionDataQuery.updatePart({
      permissions: currentState.permissions.filter(
        p => p.id !== event.permissionId
      )
    });

    let payload: ToBackendSendUserMessageToAgentRequestPayload = {
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Permission,
      permissionId: event.permissionId,
      reply: event.reply
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        payload: payload
      })
      .pipe(
        tap(() => {
          if (wasPaused) {
            this.sessionQuery.update({
              ...this.session,
              status: SessionStatusEnum.Active
            });

            let sessions = this.sessionsQuery.getValue().sessions;
            let updated = sessions.map(s =>
              s.sessionId === this.session.sessionId
                ? { ...s, status: SessionStatusEnum.Active }
                : s
            );
            this.sessionsQuery.updatePart({ sessions: updated });
          }
        }),
        catchError(() => {
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  respondToQuestion(event: { questionId: string; answers: string[][] }) {
    if (!this.session) {
      return;
    }

    let wasPaused = this.session.status === SessionStatusEnum.Paused;

    // Optimistic: remove question from store
    let currentState = this.sessionDataQuery.getValue();
    this.sessionDataQuery.updatePart({
      questions: currentState.questions.filter(q => q.id !== event.questionId)
    });

    let payload: ToBackendSendUserMessageToAgentRequestPayload = {
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Question,
      questionId: event.questionId,
      answers: event.answers
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        payload: payload
      })
      .pipe(
        tap(() => {
          if (wasPaused) {
            this.sessionQuery.update({
              ...this.session,
              status: SessionStatusEnum.Active
            });

            let sessions = this.sessionsQuery.getValue().sessions;
            let updated = sessions.map(s =>
              s.sessionId === this.session.sessionId
                ? { ...s, status: SessionStatusEnum.Active }
                : s
            );
            this.sessionsQuery.updatePart({ sessions: updated });
          }
        }),
        catchError(() => {
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  rejectQuestion(event: { questionId: string }) {
    if (!this.session) {
      return;
    }

    let wasPaused = this.session.status === SessionStatusEnum.Paused;

    // Optimistic: remove question from store
    let currentState = this.sessionDataQuery.getValue();
    this.sessionDataQuery.updatePart({
      questions: currentState.questions.filter(q => q.id !== event.questionId)
    });

    let payload: ToBackendSendUserMessageToAgentRequestPayload = {
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Question,
      questionId: event.questionId
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent,
        payload: payload
      })
      .pipe(
        tap(() => {
          if (wasPaused) {
            this.sessionQuery.update({
              ...this.session,
              status: SessionStatusEnum.Active
            });

            let sessions = this.sessionsQuery.getValue().sessions;
            let updated = sessions.map(s =>
              s.sessionId === this.session.sessionId
                ? { ...s, status: SessionStatusEnum.Active }
                : s
            );
            this.sessionsQuery.updatePart({ sessions: updated });
          }
        }),
        catchError(() => {
          return EMPTY;
        }),
        take(1)
      )
      .subscribe();
  }

  toggleDebug() {
    this.uiQuery.updatePart({ sessionDebugMode: !this.debugMode });
  }

  openTitleEditor() {
    if (!this.session) {
      return;
    }
    this.myDialogService.showEditSessionTitle({
      apiService: this.apiService,
      sessionId: this.session.sessionId,
      title: makeTitle(this.session)
    });
  }

  pauseSession() {
    if (!this.session) {
      return;
    }

    let payload: ToBackendPauseAgentSessionRequestPayload = {
      sessionId: this.session.sessionId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendPauseAgentSession,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap(() => {
          this.closeSse();
          this.stopPolling();

          this.sessionQuery.update({
            ...this.session,
            status: SessionStatusEnum.Paused
          });

          let sessions = this.sessionsQuery.getValue().sessions;
          let updated = sessions.map(s =>
            s.sessionId === this.session.sessionId
              ? { ...s, status: SessionStatusEnum.Paused }
              : s
          );
          this.sessionsQuery.updatePart({ sessions: updated });
        }),
        take(1)
      )
      .subscribe();
  }

  archiveSession() {
    if (!this.session) {
      return;
    }

    let sessionId = this.session.sessionId;

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendArchiveAgentSession,
        payload: { sessionId: sessionId },
        showSpinner: true
      })
      .pipe(
        tap(() => {
          this.closeSse();
          this.stopPolling();

          let sessions = this.sessionsQuery.getValue().sessions;
          let updated = sessions.filter(s => s.sessionId !== sessionId);
          this.sessionsQuery.updatePart({ sessions: updated });

          this.navigateService.navigateToBuilder();
        }),
        take(1)
      )
      .subscribe();
  }

  deleteSession() {
    if (!this.session) {
      return;
    }

    this.myDialogService.showDeleteSession({
      apiService: this.apiService,
      sessionId: this.session.sessionId,
      title: makeTitle(this.session)
    });
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
                : {},
              todos: resp.payload.session.todos ?? [],
              questions: resp.payload.session.questions ?? [],
              permissions: resp.payload.session.permissions ?? []
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
                : {},
              todos: resp.payload.session.todos ?? [],
              questions: resp.payload.session.questions ?? [],
              permissions: resp.payload.session.permissions ?? []
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
    // Destroy session-messages to reset scroll state
    this.isSessionSwitching = true;
    this.cd.detectChanges();

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

    this.permissions = sessionData.permissions || [];
    this.questions = sessionData.questions || [];

    this.messages = this.buildMessagesFromStores(
      sessionData.messages,
      sessionData.parts
    );
    this.turns = this.buildTurns(this.messages);

    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isArchived = this.session.status === SessionStatusEnum.Archived;
    this.isWaitingForResponse = this.checkIsWaitingForResponse(
      sessionData.sdkSessionStatus
    );
    this.retryMessage = this.getRetryMessage(sessionData.sdkSessionStatus);
    this.isSessionError = this.session.status === SessionStatusEnum.Error;

    this.previousTurnsCount = this.turns.length;
    this.previousLastTurnResponsesExist =
      this.turns[this.turns.length - 1]?.responses?.length > 0;

    if (!this.showSessionMessages) {
      this.uiQuery.updatePart({ showSessionMessages: true });
    }

    // Recreate session-messages — ngAfterViewInit will scroll to bottom
    this.isSessionSwitching = false;
    this.managePollingAndSse();
  }

  updateSessionData(sessionData: SessionDataState) {
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
    this.isWaitingForResponse =
      this.pendingUserMessages.length > 0 ||
      this.checkIsWaitingForResponse(sessionData.sdkSessionStatus);
    this.retryMessage = this.getRetryMessage(sessionData.sdkSessionStatus);
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

  getRetryMessage(sdkSessionStatus: SessionStatus): string {
    if (sdkSessionStatus?.type === 'retry') {
      return `Retrying (attempt ${sdkSessionStatus.attempt}): ${sdkSessionStatus.message}`;
    }
    return undefined;
  }

  rebuildMessagesAndTurns() {
    let data = this.sessionDataQuery.getValue();
    this.messages = this.buildMessagesFromStores(data.messages, data.parts);
    this.turns = this.buildTurns(this.messages);
  }

  buildTurns(messages: ChatMessage[]): ChatTurn[] {
    let turns: ChatTurn[] = [];
    let currentTurn: ChatTurn | undefined;

    for (let msg of messages) {
      if (msg.role === 'user') {
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

        chatMessages.push({ role: 'user', text });
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
      chatMessages.push({
        role: 'user',
        text: this.session.firstMessage
      });
    }

    // Append pending optimistic user messages
    for (let text of this.pendingUserMessages) {
      chatMessages.push({ role: 'user', text });
    }

    return chatMessages;
  }
}
