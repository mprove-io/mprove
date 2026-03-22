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
import { SessionApi } from '#common/interfaces/backend/session-api';
import { SessionEventApi } from '#common/interfaces/backend/session-event-api';
import { SessionMessageApi } from '#common/interfaces/backend/session-message-api';
import {
  ToBackendSendMessageToSessionEditorRequestPayload,
  ToBackendSendMessageToSessionEditorResponse
} from '#common/interfaces/to-backend/sessions/to-backend-send-message-to-session-editor';
import {
  ToBackendSendMessageToSessionExplorerRequestPayload,
  ToBackendSendMessageToSessionExplorerResponse
} from '#common/interfaces/to-backend/sessions/to-backend-send-message-to-session-explorer';
import { SessionQuery } from '#front/app/queries/session.query';
import {
  SessionBundleQuery,
  SessionBundleState
} from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionModelsQuery } from '#front/app/queries/session-models.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { SessionService } from '#front/app/services/session.service';
import { SessionMessagesService } from '#front/app/services/session-messages.service';
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
  liveEvents: SessionEventApi[] = [];
  messages: ChatMessage[] = [];
  turns: ChatTurn[] = [];
  permissions: PermissionRequest[] = [];
  questions: QuestionRequest[] = [];

  previousLastTurnResponsesExist = false;
  userSentMessage = false;
  isActivating = false;
  isArchived = false;

  isSessionBusy = false;
  isWorking = false;
  isAborting = false;
  isOptimisticLoading = false;
  isSessionError = false;
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

  isOptimisticLoading$ = this.uiQuery.isOptimisticLoading$.pipe(
    tap(x => {
      if (this.isOptimisticLoading !== x) {
        this.isOptimisticLoading = x;
        this.cd.detectChanges();
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
    private sessionModelsQuery: SessionModelsQuery,
    private sessionService: SessionService,
    private sessionMessagesService: SessionMessagesService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.sessionService.destroy();
  }

  updateWorkingSpinner() {
    if (this.isWorking) {
      this.workingSpinnerColor = this.retryMessage ? '#fbbf24' : '#0084d1';
      this.spinner.show(this.workingSpinnerName);
    } else {
      this.spinner.hide(this.workingSpinnerName);
    }
  }

  isLastAssistantMessageCompleted(item: {
    messages: SessionMessageApi[];
  }): boolean {
    let { messages } = item;
    if (messages.length === 0) {
      return false;
    }
    let lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') {
      return false;
    }
    let time = (lastMessage.ocMessage as { time?: { completed?: number } })
      ?.time;
    return typeof time?.completed === 'number';
  }

  enterSession(sessionData: SessionBundleState) {
    this.agent = this.session.agent;
    this.model = this.session.lastMessageProviderModel || this.session.model;
    this.variant = this.session.lastMessageVariant || 'default';

    this.sessionService.initForSession({
      lastProcessedEventIndex: sessionData.lastEventIndex
    });

    this.sessionService.clearOptimisticMessages();

    if (this.sessionInput) {
      let state = this.sessionModelsQuery.getValue();

      let models =
        this.session.type === SessionTypeEnum.Explorer
          ? state.modelsAi
          : state.modelsOpencode;

      this.sessionInput.applyModels(models);
    }

    this.permissions = sessionData.permissions || [];
    this.questions = sessionData.questions || [];

    this.messages = this.sessionMessagesService.buildMessagesFromStores({
      storeMessages: sessionData.messages,
      storeParts: sessionData.parts,
      session: this.session,
      model: this.model,
      agent: this.agent,
      variant: this.variant
    });

    this.turns = this.sessionMessagesService.buildTurns({
      messages: this.messages
    });

    this.isActivating = this.session.status === SessionStatusEnum.New;
    this.isArchived = this.session.status === SessionStatusEnum.Archived;
    this.archiveReason = this.session.archiveReason;
    this.pauseReason = this.session.pauseReason;
    this.retryMessage = this.makeRetryMessage(sessionData.ocSessionStatus);
    this.isSessionError = this.session.status === SessionStatusEnum.Error;
    this.lastSessionError = sessionData.lastSessionError;
    this.isLastErrorRecovered = sessionData.isLastErrorRecovered;

    this.isAborting = false;
    this.isOptimisticLoading = false;
    this.uiQuery.updatePart({ isOptimisticLoading: false });

    let lastAssistantCompleted = this.isLastAssistantMessageCompleted({
      messages: sessionData.messages
    });

    this.isSessionBusy =
      this.session?.status === SessionStatusEnum.Active &&
      ['busy', 'retry'].indexOf(sessionData.ocSessionStatus?.type) > -1 &&
      !lastAssistantCompleted;

    this.isWorking =
      this.session?.status === SessionStatusEnum.Active &&
      isDefined(sessionData.ocSessionStatus) &&
      ['busy', 'retry'].indexOf(sessionData.ocSessionStatus.type) > -1 &&
      !lastAssistantCompleted;

    this.updateWorkingSpinner();

    this.previousTurnsCount = this.turns.length;
    this.previousLastTurnResponsesExist =
      this.turns[this.turns.length - 1]?.responses?.length > 0;

    this.sessionService.managePollingAndSse({ skipRefresh: true });
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
      this.permissions.forEach(permission => {
        this.respondToPermission({
          permissionId: permission.id,
          reply: 'always'
        });
      });
    }

    this.messages = this.sessionMessagesService.buildMessagesFromStores({
      storeMessages: sessionData.messages,
      storeParts: sessionData.parts,
      session: this.session,
      model: this.model,
      agent: this.agent,
      variant: this.variant
    });

    this.turns = this.sessionMessagesService.buildTurns({
      messages: this.messages
    });

    this.isArchived = this.session.status === SessionStatusEnum.Archived;
    this.archiveReason = this.session.archiveReason;
    this.pauseReason = this.session.pauseReason;
    this.retryMessage = this.makeRetryMessage(sessionData.ocSessionStatus);
    this.isSessionError = this.session.status === SessionStatusEnum.Error;
    this.lastSessionError = sessionData.lastSessionError;
    this.isLastErrorRecovered = sessionData.isLastErrorRecovered;

    if (this.session?.status !== SessionStatusEnum.Active) {
      this.isOptimisticLoading = false;
      this.uiQuery.updatePart({ isOptimisticLoading: false });
    }

    let wasActivating = this.isActivating;
    this.isActivating = this.session.status === SessionStatusEnum.New;
    let justActivated = wasActivating && !this.isActivating;

    if (justActivated && !this.isActivating && !!this.session.firstMessage) {
      this.isOptimisticLoading = true;
      this.uiQuery.updatePart({ isOptimisticLoading: true });
    }

    let lastAssistantCompleted = this.isLastAssistantMessageCompleted({
      messages: sessionData.messages
    });

    if (lastAssistantCompleted && this.isOptimisticLoading) {
      this.isOptimisticLoading = false;
      this.uiQuery.updatePart({ isOptimisticLoading: false });
    }

    this.isSessionBusy =
      this.isOptimisticLoading ||
      (this.questions.length === 0 &&
        this.permissions.length === 0 &&
        this.session?.status === SessionStatusEnum.Active &&
        ['busy', 'retry'].indexOf(sessionData.ocSessionStatus?.type) > -1 &&
        !lastAssistantCompleted);

    if (
      this.session?.status === SessionStatusEnum.Active &&
      isDefined(sessionData.ocSessionStatus) &&
      ['busy', 'retry'].indexOf(sessionData.ocSessionStatus.type) < 0
    ) {
      this.isAborting = false;
    }

    this.isWorking =
      this.isOptimisticLoading ||
      (this.session?.status === SessionStatusEnum.Active &&
        isDefined(sessionData.ocSessionStatus) &&
        ['busy', 'retry'].indexOf(sessionData.ocSessionStatus.type) > -1 &&
        this.isAborting === false &&
        !lastAssistantCompleted);

    this.updateWorkingSpinner();

    this.sessionService.managePollingAndSse({
      skipRefresh: justActivated
    });

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

  makeRetryMessage(ocSessionStatus: SessionStatus): string {
    if (ocSessionStatus?.type === 'retry') {
      return `Retrying (attempt ${ocSessionStatus.attempt}): ${ocSessionStatus.message}`;
    }
    return undefined;
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

  sendFollowUp(text: string) {
    if (!this.session) {
      return;
    }

    this.userSentMessage = true;

    let { messageId, partId } = this.sessionService.optimisticAdd({
      sessionId: this.session.sessionId,
      ocSessionId: this.session.opencodeSessionId || '',
      agent: this.agent,
      model: this.model,
      text: text,
      variant: this.variant
    });

    // Rebuild chat messages and turns
    let updatedData = this.sessionBundleQuery.getValue();
    this.messages = this.sessionMessagesService.buildMessagesFromStores({
      storeMessages: updatedData.messages,
      storeParts: updatedData.parts,
      session: this.session,
      model: this.model,
      agent: this.agent,
      variant: this.variant
    });

    this.turns = this.sessionMessagesService.buildTurns({
      messages: this.messages
    });

    this.isSessionBusy = true;
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

  sendInteraction(item: {
    sessionId: string;
    interactionType: InteractionTypeEnum;
    messageId?: string;
    partId?: string;
    message?: string;
    model?: string;
    variant?: string;
    agent?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
  }) {
    let isExplorer = this.session.type === SessionTypeEnum.Explorer;

    if (isExplorer) {
      let explorerPayload: ToBackendSendMessageToSessionExplorerRequestPayload =
        {
          sessionId: item.sessionId,
          interactionType: item.interactionType,
          messageId: item.messageId,
          partId: item.partId,
          message: item.message,
          model: item.model,
          variant: item.variant
        };

      this.apiService
        .req({
          pathInfoName:
            ToBackendRequestInfoNameEnum.ToBackendSendMessageToSessionExplorer,
          payload: explorerPayload
        })
        .pipe(
          tap((resp: ToBackendSendMessageToSessionExplorerResponse) => {
            this.processSendInteractionResponse({ resp: resp });
          }),
          take(1)
        )
        .subscribe({
          error: () => {
            this.handleSendInteractionError({ messageId: item.messageId });
          }
        });
    } else {
      let editorPayload: ToBackendSendMessageToSessionEditorRequestPayload = {
        sessionId: item.sessionId,
        interactionType: item.interactionType,
        messageId: item.messageId,
        partId: item.partId,
        message: item.message,
        model: item.model,
        variant: item.variant,
        agent: item.agent,
        permissionId: item.permissionId,
        reply: item.reply,
        questionId: item.questionId,
        answers: item.answers
      };

      this.apiService
        .req({
          pathInfoName:
            ToBackendRequestInfoNameEnum.ToBackendSendMessageToSessionEditor,
          payload: editorPayload
        })
        .pipe(
          tap((resp: ToBackendSendMessageToSessionEditorResponse) => {
            this.processSendInteractionResponse({ resp: resp });
          }),
          take(1)
        )
        .subscribe({
          error: () => {
            this.handleSendInteractionError({ messageId: item.messageId });
          }
        });
    }
  }

  processSendInteractionResponse(item: {
    resp:
      | ToBackendSendMessageToSessionExplorerResponse
      | ToBackendSendMessageToSessionEditorResponse;
  }) {
    let { resp } = item;
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
  }

  handleSendInteractionError(item: { messageId: string }) {
    let { messageId } = item;
    this.sessionService.optimisticRemove({
      messageId: messageId
    });
    this.isSessionBusy = false;
    this.isWorking = false;
    this.uiQuery.updatePart({ isOptimisticLoading: false });
    this.updateWorkingSpinner();
    this.cd.detectChanges();
  }
}
