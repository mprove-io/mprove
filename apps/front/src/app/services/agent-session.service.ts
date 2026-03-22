import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { exhaustMap, take, tap } from 'rxjs/operators';
import { RELOAD_SESSION_EVENT_TYPE } from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { splitModel } from '#common/functions/split-model';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { SessionEventApi } from '#common/interfaces/backend/session-event-api';
import { ErrorData } from '#common/interfaces/front/error-data';
import {
  ToBackendCreateSessionSseTicketRequestPayload,
  ToBackendCreateSessionSseTicketResponse
} from '#common/interfaces/to-backend/sessions/to-backend-create-session-sse-ticket';
import {
  ToBackendGetSessionRequestPayload,
  ToBackendGetSessionResponse,
  ToBackendGetSessionResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-get-session';
import { binarySearch } from '#front/app/functions/binary-search';
import { groupPartsByMessageId } from '#front/app/functions/group-parts-by-message-id';
import { makeAscendingId } from '#front/app/functions/make-ascending-id';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { AgentEventsService } from '#front/app/services/agent-events.service';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { environment } from '#front/environments/environment';

type SsePhase =
  | 'idle'
  | 'fetching-ticket'
  | 'connected'
  | 'waiting-to-reconnect';

@Injectable({ providedIn: 'root' })
export class AgentSessionService {
  private initId = 0;
  private ssePhase: SsePhase = 'idle';
  private reconnectCounter = 0;
  private SSE_MAX_RECONNECTS = 3;
  private lastProcessedEventIndex = -1;
  private eventSource: EventSource;

  private SSE_RECONNECT_DELAY_MS = 3000;

  private sseEventBuffer: SessionEventApi[] = [];
  private sseRafId: number;

  private pollSubscription: Subscription;

  private optimisticMessages: Map<
    string,
    { message: AgentMessageApi; parts: AgentPartApi[] }
  > = new Map();

  constructor(
    private apiService: ApiService,
    private sessionQuery: SessionQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionsQuery: SessionsQuery,
    private agentEventsService: AgentEventsService,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private uiQuery: UiQuery
  ) {}

  optimisticAdd(item: {
    sessionId: string;
    ocSessionId: string;
    agent: string;
    model: string;
    text: string;
    variant: string;
  }): { messageId: string; partId: string } {
    let { sessionId, ocSessionId, agent, model, text, variant } = item;

    let messageId = makeAscendingId({ prefix: 'message' });
    let partId = makeAscendingId({ prefix: 'part' });

    let modelSplit = splitModel(model) || {
      providerID: '',
      modelID: model || ''
    };

    let optimisticMessage: AgentMessageApi = {
      messageId: messageId,
      sessionId: sessionId,
      role: 'user',
      ocMessage: {
        id: messageId,
        sessionID: ocSessionId,
        role: 'user',
        variant: variant,
        time: { created: Date.now() },
        agent: agent,
        model: modelSplit
      } as any
    };

    let optimisticPart: AgentPartApi = {
      partId: partId,
      messageId: messageId,
      sessionId: sessionId,
      ocPart: {
        id: partId,
        sessionID: ocSessionId,
        messageID: messageId,
        type: 'text',
        text: text
      } as any
    };

    this.optimisticMessages.set(messageId, {
      message: optimisticMessage,
      parts: [optimisticPart]
    });

    let data = this.sessionBundleQuery.getValue();
    let messages = [...data.messages];
    let parts = { ...data.parts };

    let result = binarySearch(messages, messageId, m => m.messageId);
    messages.splice(result.index, 0, optimisticMessage);
    parts[messageId] = [optimisticPart];

    this.sessionBundleQuery.updatePart({
      messages: messages,
      parts: parts
    });

    return { messageId: messageId, partId: partId };
  }

  optimisticRemove(item: { messageId: string }) {
    let { messageId } = item;

    if (!messageId || !this.optimisticMessages.has(messageId)) {
      return;
    }

    this.optimisticMessages.delete(messageId);

    let data = this.sessionBundleQuery.getValue();
    let messages = [...data.messages];
    let parts = { ...data.parts };

    let result = binarySearch(messages, messageId, m => m.messageId);
    if (result.found) {
      messages.splice(result.index, 1);
    }
    delete parts[messageId];

    this.sessionBundleQuery.updatePart({
      messages: messages,
      parts: parts
    });
  }

  clearOptimisticMessages() {
    this.optimisticMessages = new Map();
  }

  applySessionResponse(item: {
    payload: ToBackendGetSessionResponsePayload;
    withOptimisticMerge: boolean;
  }): void {
    let { payload, withOptimisticMerge } = item;

    this.sessionQuery.update(payload.session);

    let messages = payload.messages;

    let parts = groupPartsByMessageId(payload.parts);

    if (withOptimisticMerge) {
      let merged = this.mergeOptimistic({ messages: messages, parts: parts });

      merged.confirmed.forEach(id => this.optimisticMessages.delete(id));

      messages = merged.messages;

      parts = merged.parts;
    }

    this.sessionBundleQuery.updatePart({
      messages: messages,
      parts: parts,
      todos: payload.ocSession?.todos ?? [],
      questions: payload.ocSession?.questions ?? [],
      permissions: payload.ocSession?.permissions ?? [],
      ocSessionStatus: payload.ocSession?.ocSessionStatus,
      lastSessionError: payload.ocSession?.lastSessionError,
      isLastErrorRecovered: payload.ocSession?.isLastErrorRecovered,
      lastEventIndex: payload.lastEventIndex
    });

    this.sessionEventsQuery.updatePart({
      liveEvents: payload.events
    });

    this.agentEventsService.resetDeltaGuard();

    let ocEvents = payload.events.filter(e => e.ocEvent).map(e => e.ocEvent);

    if (ocEvents.length > 0) {
      this.agentEventsService.applyEvents(ocEvents);
    }
  }

  initForSession(item: { lastProcessedEventIndex: number }) {
    let { lastProcessedEventIndex } = item;

    this.initId++;
    this.destroy();
    this.reconnectCounter = 0;
    this.lastProcessedEventIndex = lastProcessedEventIndex;
  }

  managePollingAndSse(item?: { skipRefresh?: boolean }) {
    let session = this.sessionQuery.getValue();

    if (session.status === SessionStatusEnum.New && !this.pollSubscription) {
      this.startPolling({ sessionId: session.sessionId });
    }

    if (session.status !== SessionStatusEnum.New && this.pollSubscription) {
      this.stopPolling();
    }

    if (
      session.status !== SessionStatusEnum.Active &&
      this.ssePhase !== 'idle'
    ) {
      this.closeSse();
    }

    if (
      session.status === SessionStatusEnum.Active &&
      this.ssePhase === 'idle'
    ) {
      if (item?.skipRefresh) {
        this.connectSse({ sessionId: session.sessionId });
      } else {
        this.refreshAndConnectSse({ sessionId: session.sessionId });
      }
    }
  }

  destroy() {
    this.closeSse();
    this.stopPolling();
  }

  private closeSse() {
    console.log('closeSse - closing, was phase:', this.ssePhase);
    this.closeEventSource();
    this.ssePhase = 'idle';
  }

  private closeEventSource() {
    this.flushSseBuffer();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private stopPolling() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  private startPolling(item: { sessionId: string }) {
    let { sessionId } = item;

    let payload: ToBackendGetSessionRequestPayload = {
      sessionId: sessionId,
      skipFetchSessionState: true
    };

    this.pollSubscription = interval(1000)
      .pipe(
        exhaustMap(() =>
          this.apiService.req({
            pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetSession,
            payload: payload
          })
        ),
        tap((resp: ToBackendGetSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.applySessionResponse({
              payload: resp.payload,
              withOptimisticMerge: true
            });

            this.lastProcessedEventIndex = resp.payload.lastEventIndex;

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

  private connectSse(item: { sessionId: string }) {
    let { sessionId } = item;

    if (this.ssePhase !== 'idle') {
      return;
    }

    let initId = this.initId;

    this.ssePhase = 'fetching-ticket';

    let payload: ToBackendCreateSessionSseTicketRequestPayload = {
      sessionId: sessionId
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendCreateSessionSseTicket,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateSessionSseTicketResponse) => {
          if (this.initId !== initId) {
            return;
          }

          this.ssePhase = 'idle';

          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            console.log('connectSse - get ticket - ok');
            this.connectSseWithTicket({
              sessionId: sessionId,
              sseTicket: resp.payload.sseTicket,
              initId: initId
            });
          } else {
            console.log('connectSse - get ticket - error');
          }
        }),
        take(1)
      )
      .subscribe();
  }

  private connectSseWithTicket(item: {
    sessionId: string;
    sseTicket: string;
    initId: number;
  }) {
    let { sessionId, sseTicket, initId } = item;

    if (this.initId !== initId) {
      return;
    }

    this.closeSse();

    let url =
      environment.httpUrl +
      `/api/sse/session-events?sessionId=${sessionId}&ticket=${sseTicket}&lastEventIndex=${this.lastProcessedEventIndex}`;

    this.eventSource = new EventSource(url);
    this.ssePhase = 'connected';

    this.eventSource.onopen = () => {
      console.log('eventSource - sse connected');
    };

    this.eventSource.addEventListener(
      'session-event',
      (event: MessageEvent) => {
        let sessionEvent: SessionEventApi = JSON.parse(event.data);

        if (sessionEvent.eventType === RELOAD_SESSION_EVENT_TYPE) {
          console.log('eventSource - reloading session...');
          this.reconnectCounter = 0;
          this.scheduleReconnect({ sessionId: sessionId, delay: 0 });
          return;
        }

        if (sessionEvent.eventIndex <= this.lastProcessedEventIndex) {
          return;
        }

        this.reconnectCounter = 0;
        this.sseEventBuffer.push(sessionEvent);

        if (this.sseRafId === undefined) {
          this.sseRafId = requestAnimationFrame(() => {
            this.flushSseBuffer();
          });
        }
      }
    );

    this.eventSource.onerror = () => {
      this.reconnectCounter++;
      console.log(
        `eventSource.onerror, reconnectCounter: ${this.reconnectCounter}`
      );
      if (this.reconnectCounter > this.SSE_MAX_RECONNECTS) {
        this.closeSse();
        let errorData = new ErrorData();
        errorData.message = 'Session connection lost';
        errorData.description = 'Try to reload session...';
        errorData.leftButtonText = 'Ok';
        errorData.leftOnClickFnBindThis = (() => {
          this.navigateService.navigateToBuilder();
        }).bind(this);
        this.myDialogService.showError({
          errorData: errorData,
          isThrow: false
        });
        return;
      }
      this.scheduleReconnect({
        sessionId: sessionId,
        delay: this.SSE_RECONNECT_DELAY_MS
      });
    };
  }

  private scheduleReconnect(item: { sessionId: string; delay: number }) {
    let { sessionId, delay } = item;

    this.closeEventSource();

    if (this.ssePhase === 'waiting-to-reconnect') {
      return;
    }

    this.ssePhase = 'waiting-to-reconnect';

    let initId = this.initId;

    setTimeout(() => {
      if (this.initId !== initId) {
        return;
      }

      let session = this.sessionQuery.getValue();
      if (
        session?.sessionId === sessionId &&
        session?.status === SessionStatusEnum.Active
      ) {
        this.refreshAndConnectSse({ sessionId: sessionId });
      } else {
        this.ssePhase = 'idle';
      }
    }, delay);
  }

  private refreshAndConnectSse(item: { sessionId: string }) {
    let { sessionId } = item;
    let initId = this.initId;
    this.ssePhase = 'fetching-ticket';

    let payload: ToBackendGetSessionRequestPayload = {
      sessionId: sessionId,
      skipFetchSessionState: true
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetSession,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetSessionResponse) => {
          if (this.initId !== initId) {
            return;
          }

          this.ssePhase = 'idle';

          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.lastProcessedEventIndex = resp.payload.lastEventIndex;

            // Connect SSE BEFORE store updates to prevent re-entry
            // (store updates trigger managePollingAndSse synchronously;
            //  connectSse sets ssePhase='fetching-ticket' which blocks re-entry)
            if (resp.payload.session.status === SessionStatusEnum.Active) {
              this.connectSse({ sessionId: sessionId });
            }

            this.applySessionResponse({
              payload: resp.payload,
              withOptimisticMerge: true
            });

            let sessions = this.sessionsQuery.getValue().sessions;
            let updated = sessions.map(s =>
              s.sessionId === sessionId ? resp.payload.session : s
            );
            this.sessionsQuery.updatePart({ sessions: updated });

            console.log('refreshAndConnectSse - get session - ok');
          }
        }),
        take(1)
      )
      .subscribe();
  }

  mergeOptimistic(item: {
    messages: AgentMessageApi[];
    parts: { [messageId: string]: AgentPartApi[] };
  }): {
    messages: AgentMessageApi[];
    parts: { [messageId: string]: AgentPartApi[] };
    confirmed: string[];
  } {
    if (this.optimisticMessages.size === 0) {
      return {
        messages: item.messages,
        parts: item.parts,
        confirmed: []
      };
    }

    let messages = [...item.messages];
    let parts = { ...item.parts };
    let confirmed: string[] = [];

    this.optimisticMessages.forEach((entry, messageId) => {
      let result = binarySearch(messages, messageId, m => m.messageId);

      if (!result.found) {
        // Message not in server data — insert optimistic message + parts
        messages.splice(result.index, 0, entry.message);
        parts[messageId] = entry.parts;
      } else {
        // Message exists in server data — check if all optimistic part IDs are present
        let serverParts = parts[messageId] || [];
        let hasAllParts = entry.parts.every(p => {
          let r = binarySearch(serverParts, p.partId, sp => sp.partId);
          return r.found;
        });

        if (hasAllParts) {
          // Server has all optimistic parts — confirmed
          confirmed.push(messageId);
        } else {
          // Server has message but missing some parts — merge optimistic parts in
          let merged = serverParts ? [...serverParts] : [];
          let changed = false;
          entry.parts.forEach(p => {
            let r = binarySearch(merged, p.partId, sp => sp.partId);
            if (!r.found) {
              merged.splice(r.index, 0, p);
              changed = true;
            }
          });
          if (changed || !serverParts) {
            parts[messageId] = merged;
          }
        }
      }
    });

    return { messages: messages, parts: parts, confirmed: confirmed };
  }

  private flushSseBuffer() {
    if (this.sseRafId !== undefined) {
      cancelAnimationFrame(this.sseRafId);
      this.sseRafId = undefined;
    }

    let buffer = this.sseEventBuffer;
    if (buffer.length === 0) return;

    this.sseEventBuffer = [];

    // Batch live events store update
    let currentLiveEvents = this.sessionEventsQuery.getValue().liveEvents;

    let updatedLiveEvents = [...currentLiveEvents, ...buffer].sort(
      (a, b) => a.eventIndex - b.eventIndex
    );
    this.sessionEventsQuery.updatePart({ liveEvents: updatedLiveEvents });

    // Batch reducer events
    let ocEvents = buffer.filter(e => e.ocEvent).map(e => e.ocEvent);
    if (ocEvents.length > 0) {
      this.agentEventsService.applyEvents(ocEvents);
    }

    if (
      buffer.some(
        e => e.eventType === 'session.status'
        //  || e.eventType === 'session.idle'
        //  &&
        //   (e.ocEvent?.properties as { status?: { type?: string } })?.status
        //     ?.type === 'busy'
      )
    ) {
      setTimeout(() => {
        console.log('isOptimisticLoading updated');
        this.uiQuery.updatePart({ isOptimisticLoading: false });
      }, 0);
    }

    // Update lastProcessedEventIndex from batch
    let maxIndex = buffer.reduce(
      (max, e) => Math.max(max, e.eventIndex),
      this.lastProcessedEventIndex
    );
    this.lastProcessedEventIndex = maxIndex;
  }
}
