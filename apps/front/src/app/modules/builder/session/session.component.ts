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
  SessionStatus
} from '@opencode-ai/sdk/v2';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { SessionApi } from '#common/interfaces/backend/session-api';
import {
  ToBackendSendUserMessageToAgentRequestPayload,
  ToBackendSendUserMessageToAgentResponse
} from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';
import { AgentModelsQuery } from '#front/app/queries/agent-models.query';
import { SessionQuery } from '#front/app/queries/session.query';
import {
  SessionBundleQuery,
  SessionBundleState
} from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { AgentMessagesService } from '#front/app/services/agent-messages.service';
import { AgentSessionService } from '#front/app/services/agent-session.service';
import { ApiService } from '#front/app/services/api.service';
import { ChatMessage, ChatTurn } from './session-chat.interfaces';
import { SessionInputComponent } from './session-input/session-input.component';
import { SessionMessagesComponent } from './session-messages/session-messages.component';

@Component({
  standalone: false,
  selector: 'm-session',
  templateUrl: './session.component.html'
})
export class SessionComponent implements OnInit, OnDestroy {
  @ViewChild(SessionInputComponent) sessionInput: SessionInputComponent;

  @ViewChild(SessionMessagesComponent)
  sessionMessages: SessionMessagesComponent;

  archiveReasonEnum = ArchiveReasonEnum;
  pauseReasonEnum = PauseReasonEnum;
  sessionStatusEnum = SessionStatusEnum;
  sessionTypeEnum = SessionTypeEnum;

  agent = 'plan';
  model: string;
  variant = 'default';

  session: SessionApi;
  liveEvents: AgentEventApi[] = [];
  messages: ChatMessage[] = [];
  turns: ChatTurn[] = [];
  permissions: PermissionRequest[] = [];
  questions: QuestionRequest[] = [];

  previousLastTurnResponsesExist = false;
  userSentMessage = false;
  isActivating = false;
  isArchived = false;

  isAgentBusy = false;
  isWorking = false;
  isAborting = false;
  isOptimisticLoading = false;
  isSessionError = false;
  showEvents = false;
  allEventsExpanded = false;
  isLastErrorRecovered: boolean;

  scrollTrigger = 0;
  previousTurnsCount = 0;
  previousSessionId: string;
  archiveReason: ArchiveReasonEnum;
  pauseReason: PauseReasonEnum;
  retryMessage: string;
  lastSessionError: Record<string, unknown>;
  workingSpinnerName = 'sessionInProgress';
  workingSpinnerColor = '#0084d1';
  debugExpandedEvents: Record<string, boolean> = {};
  permissionsAutoAcceptSessionIds: string[] = [];
  permissionsAutoAcceptSessionIds$ =
    this.uiQuery.permissionsAutoAcceptSessionIds$.pipe(
      tap(ids => {
        this.permissionsAutoAcceptSessionIds = ids || [];
        this.cd.detectChanges();
      })
    );

  liveEvents$ = this.sessionEventsQuery.liveEvents$.pipe(
    tap(x => {
      this.liveEvents = x;
      this.cd.detectChanges();
    })
  );

  showEvents$ = this.uiQuery.sessionShowEvents$.pipe(
    tap(x => {
      this.showEvents = x;
      this.cd.detectChanges();
    })
  );

  isOptimisticLoading$ = this.uiQuery.isOptimisticLoading$.pipe(
    tap(x => {
      if (this.isOptimisticLoading !== x) {
        this.isOptimisticLoading = x;
        this.cd.detectChanges();
      }
    })
  );

  toggleAllEventsLastValue = 0;
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
      } else if (hasSession && !hadPrevSession) {
        // Session selected — first load
        this.enterSession(sessionData);
      } else if (
        hasSession &&
        hadPrevSession &&
        currentSessionId === this.previousSessionId
      ) {
        // Same session — data update (streaming/polling)
        this.updateSessionData(sessionData);
      } else if (
        hasSession &&
        hadPrevSession &&
        currentSessionId !== this.previousSessionId
      ) {
        // Session changed — switching from one to another
        // should not be there because of showContent flag
        console.log(
          'hasSession && hadPrevSession && currentSessionId !== this.previousSessionId'
        );
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
    private sessionBundleQuery: SessionBundleQuery,
    private uiQuery: UiQuery,
    private agentModelsQuery: AgentModelsQuery,
    private agentSessionService: AgentSessionService,
    private agentMessagesService: AgentMessagesService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.agentSessionService.destroy();
  }

  updateWorkingSpinner() {
    if (this.isWorking) {
      this.workingSpinnerColor = this.retryMessage ? '#fbbf24' : '#0084d1';
      this.spinner.show(this.workingSpinnerName);
    } else {
      this.spinner.hide(this.workingSpinnerName);
    }
  }

  checkIsAgentBusy(ocSessionStatus: SessionStatus): boolean {
    if (this.session?.status !== SessionStatusEnum.Active) {
      return false;
    }

    if (
      isDefined(ocSessionStatus) &&
      ['busy', 'retry'].indexOf(ocSessionStatus.type) > -1
    ) {
      return true;
    }
    return false;
  }

  checkIsWorking(ocSessionStatus: SessionStatus): boolean {
    if (this.session?.status !== SessionStatusEnum.Active) {
      return false;
    }

    if (ocSessionStatus) {
      let isBusy = ['busy', 'retry'].indexOf(ocSessionStatus.type) > -1;

      if (!isBusy) {
        this.isAborting = false;
      }

      if (this.isAborting) {
        return false;
      }
      return isBusy;
    }
    return false;
  }

  getRetryMessage(ocSessionStatus: SessionStatus): string {
    if (ocSessionStatus?.type === 'retry') {
      return `Retrying (attempt ${ocSessionStatus.attempt}): ${ocSessionStatus.message}`;
    }
    return undefined;
  }

  toggleAllEvents() {
    this.allEventsExpanded = !this.allEventsExpanded;
    let expanded: Record<string, boolean> = {};
    if (this.allEventsExpanded) {
      this.liveEvents.forEach(event => {
        expanded[event.eventId] = true;
      });
    }
    this.debugExpandedEvents = expanded;
    this.uiQuery.updatePart({
      sessionAllEventsExpanded: this.allEventsExpanded
    });
  }

  sendFollowUp(text: string) {
    if (!this.session) {
      return;
    }

    this.userSentMessage = true;

    let { messageId, partId } = this.agentSessionService.optimisticAdd({
      sessionId: this.session.sessionId,
      ocSessionId: this.session.opencodeSessionId || '',
      agent: this.agent,
      model: this.model,
      text: text,
      variant: this.variant
    });

    // Rebuild chat messages and turns
    let updatedData = this.sessionBundleQuery.getValue();
    this.messages = this.agentMessagesService.buildMessagesFromStores({
      storeMessages: updatedData.messages,
      storeParts: updatedData.parts,
      session: this.session,
      model: this.model,
      agent: this.agent,
      variant: this.variant
    });

    this.turns = this.agentMessagesService.buildTurns({
      messages: this.messages
    });

    this.isAgentBusy = true;
    this.isWorking = true;
    this.uiQuery.updatePart({ isOptimisticLoading: true });

    this.updateWorkingSpinner();

    this.scrollTrigger++;
    this.sessionMessages?.scrollToBottom();

    this.cd.detectChanges();

    this.sendInteraction({
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Message,
      message: text,
      model: this.model,
      variant: this.variant,
      agent: this.agent,
      messageId: messageId,
      partId: partId
    });
  }

  stopSession() {
    if (!this.session) {
      return;
    }

    this.isAborting = true;
    this.isWorking = false;
    this.uiQuery.updatePart({ isOptimisticLoading: false });
    this.cd.detectChanges();

    this.sessionMessages?.scrollToBottom();

    this.sendInteraction({
      sessionId: this.session.sessionId,
      interactionType: InteractionTypeEnum.Stop
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

    this.sessionMessages?.scrollToBottom();

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

    this.sessionMessages?.scrollToBottom();

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

    this.sessionMessages?.scrollToBottom();

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

          if (session.sessionId === this.session?.sessionId) {
            this.sessionQuery.update(session);

            let sessions = this.sessionsQuery.getValue().sessions;

            this.sessionsQuery.updatePart({
              sessions: sessions.map(x =>
                x.sessionId === session.sessionId ? session : x
              )
            });
          }
        }),
        take(1)
      )
      .subscribe({
        error: () => {
          this.agentSessionService.optimisticRemove({
            messageId: payload.messageId
          });
          this.isAgentBusy = false;
          this.isWorking = false;
          this.uiQuery.updatePart({ isOptimisticLoading: false });
          this.updateWorkingSpinner();
          this.cd.detectChanges();
        }
      });
  }

  enterSession(sessionData: SessionBundleState) {
    this.agent = this.session.agent;
    this.model = this.session.lastMessageProviderModel || this.session.model;
    this.agentSessionService.initForSession({
      lastProcessedEventIndex: sessionData.lastEventIndex
    });
    this.isAborting = false;
    this.uiQuery.updatePart({ isOptimisticLoading: false });
    this.agentSessionService.clearOptimisticMessages();
    let savedVariant = this.session.lastMessageVariant || 'default';
    this.variant = savedVariant;

    if (this.sessionInput) {
      let state = this.agentModelsQuery.getValue();

      let models =
        this.session.type === SessionTypeEnum.Explorer
          ? state.modelsAi
          : state.modelsOpencode;

      this.sessionInput.applyModels(models);
    }

    this.permissions = sessionData.permissions || [];
    this.questions = sessionData.questions || [];

    this.messages = this.agentMessagesService.buildMessagesFromStores({
      storeMessages: sessionData.messages,
      storeParts: sessionData.parts,
      session: this.session,
      model: this.model,
      agent: this.agent,
      variant: this.variant
    });
    this.turns = this.agentMessagesService.buildTurns({
      messages: this.messages
    });

    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isArchived = this.session.status === SessionStatusEnum.Archived;
    this.archiveReason = this.session.archiveReason;
    this.pauseReason = this.session.pauseReason;
    this.isAgentBusy = this.checkIsAgentBusy(sessionData.ocSessionStatus);
    this.isWorking = this.checkIsWorking(sessionData.ocSessionStatus);
    this.retryMessage = this.getRetryMessage(sessionData.ocSessionStatus);
    this.isSessionError = this.session.status === SessionStatusEnum.Error;
    this.lastSessionError = sessionData.lastSessionError;
    this.isLastErrorRecovered = sessionData.isLastErrorRecovered;

    this.updateWorkingSpinner();

    this.previousTurnsCount = this.turns.length;
    this.previousLastTurnResponsesExist =
      this.turns[this.turns.length - 1]?.responses?.length > 0;

    this.agentSessionService.managePollingAndSse({ skipRefresh: true });
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

    this.permissions = sessionData.permissions || [];
    this.questions = sessionData.questions || [];

    let ids = this.uiQuery.getValue().permissionsAutoAcceptSessionIds || [];

    if (
      this.session?.sessionId &&
      ids.includes(this.session.sessionId) &&
      this.permissions.length > 0
    ) {
      // auto respond
      this.permissions.forEach(permission => {
        this.respondToPermission({
          permissionId: permission.id,
          reply: 'always'
        });
      });
    }

    this.messages = this.agentMessagesService.buildMessagesFromStores({
      storeMessages: sessionData.messages,
      storeParts: sessionData.parts,
      session: this.session,
      model: this.model,
      agent: this.agent,
      variant: this.variant
    });
    this.turns = this.agentMessagesService.buildTurns({
      messages: this.messages
    });

    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isArchived = this.session.status === SessionStatusEnum.Archived;
    this.archiveReason = this.session.archiveReason;
    this.pauseReason = this.session.pauseReason;

    if (this.session?.status !== SessionStatusEnum.Active) {
      this.isOptimisticLoading = false;
      this.uiQuery.updatePart({ isOptimisticLoading: false });
    }

    this.isAgentBusy =
      this.isOptimisticLoading ||
      (this.questions.length === 0 &&
        this.permissions.length === 0 &&
        this.checkIsAgentBusy(sessionData.ocSessionStatus));

    this.isWorking =
      this.isOptimisticLoading ||
      (!this.isAborting && this.checkIsWorking(sessionData.ocSessionStatus));

    this.retryMessage = this.getRetryMessage(sessionData.ocSessionStatus);

    this.isSessionError = this.session.status === SessionStatusEnum.Error;
    this.lastSessionError = sessionData.lastSessionError;
    this.isLastErrorRecovered = sessionData.isLastErrorRecovered;

    this.updateWorkingSpinner();

    this.agentSessionService.managePollingAndSse();

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
}
