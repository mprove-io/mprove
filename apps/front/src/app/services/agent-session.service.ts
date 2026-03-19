import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { exhaustMap, take, tap } from 'rxjs/operators';
import { RELOAD_SESSION_EVENT_TYPE } from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { ErrorData } from '#common/interfaces/front/error-data';
import {
  ToBackendCreateAgentSseTicketRequestPayload,
  ToBackendCreateAgentSseTicketResponse
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-sse-ticket';
import {
  ToBackendGetAgentSessionRequestPayload,
  ToBackendGetAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import { groupPartsByMessageId } from '#front/app/functions/group-parts-by-message-id';
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

  private sseEventBuffer: AgentEventApi[] = [];
  private sseRafId: number;

  private pollSubscription: Subscription;

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

    let payload: ToBackendGetAgentSessionRequestPayload = {
      sessionId: sessionId
    };

    this.pollSubscription = interval(1000)
      .pipe(
        exhaustMap(() =>
          this.apiService.req({
            pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
            payload: payload
          })
        ),
        tap((resp: ToBackendGetAgentSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.sessionQuery.update(resp.payload.session);

            if (resp.payload.debugEvents.length > 0) {
              this.sessionEventsQuery.updatePart({
                debugEvents: resp.payload.debugEvents
              });
            }

            this.sessionBundleQuery.updatePart({
              messages: resp.payload.messages || [],
              parts: resp.payload.parts
                ? groupPartsByMessageId(resp.payload.parts)
                : {},
              todos: resp.payload.ocSession?.todos ?? [],
              questions: resp.payload.ocSession?.questions ?? [],
              permissions: resp.payload.ocSession?.permissions ?? [],
              ocSessionStatus: resp.payload.ocSession?.ocSessionStatus,
              lastSessionError: resp.payload.ocSession?.lastSessionError,
              isLastErrorRecovered:
                resp.payload.ocSession?.isLastErrorRecovered,
              lastEventIndex: resp.payload.lastEventIndex
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

  private connectSse(item: { sessionId: string }) {
    let { sessionId } = item;

    if (this.ssePhase !== 'idle') {
      return;
    }

    let initId = this.initId;

    this.ssePhase = 'fetching-ticket';

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
      `/api/sse/agent-events?sessionId=${sessionId}&ticket=${sseTicket}&lastEventIndex=${this.lastProcessedEventIndex}`;

    this.eventSource = new EventSource(url);
    this.ssePhase = 'connected';

    this.eventSource.onopen = () => {
      console.log('eventSource - sse connected');
    };

    this.eventSource.addEventListener('agent-event', (event: MessageEvent) => {
      let agentEvent: AgentEventApi = JSON.parse(event.data);

      if (agentEvent.eventType === RELOAD_SESSION_EVENT_TYPE) {
        console.log('eventSource - reloading session...');
        this.reconnectCounter = 0;
        this.scheduleReconnect({ sessionId: sessionId, delay: 0 });
        return;
      }

      if (agentEvent.eventIndex <= this.lastProcessedEventIndex) {
        return;
      }

      this.reconnectCounter = 0;
      this.sseEventBuffer.push(agentEvent);

      if (this.sseRafId === undefined) {
        this.sseRafId = requestAnimationFrame(() => {
          this.flushSseBuffer();
        });
      }
    });

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
          if (this.initId !== initId) {
            return;
          }

          this.ssePhase = 'idle';

          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            if (resp.payload.debugEvents.length > 0) {
              this.sessionEventsQuery.updatePart({
                debugEvents: resp.payload.debugEvents
              });
            }

            this.lastProcessedEventIndex = resp.payload.lastEventIndex;

            // Connect SSE BEFORE store updates to prevent re-entry
            // (store updates trigger managePollingAndSse synchronously;
            //  connectSse sets ssePhase='fetching-ticket' which blocks re-entry)
            if (resp.payload.session.status === SessionStatusEnum.Active) {
              this.connectSse({ sessionId: sessionId });
            }

            this.sessionQuery.update(resp.payload.session);

            this.sessionBundleQuery.updatePart({
              messages: resp.payload.messages || [],
              parts: resp.payload.parts
                ? groupPartsByMessageId(resp.payload.parts)
                : {},
              todos: resp.payload.ocSession?.todos ?? [],
              questions: resp.payload.ocSession?.questions ?? [],
              permissions: resp.payload.ocSession?.permissions ?? [],
              ocSessionStatus: resp.payload.ocSession?.ocSessionStatus,
              lastSessionError: resp.payload.ocSession?.lastSessionError,
              isLastErrorRecovered:
                resp.payload.ocSession?.isLastErrorRecovered,
              lastEventIndex: resp.payload.lastEventIndex
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

    // Detect busy status event in batch
    let hasBusy = buffer.some(
      e =>
        e.eventType === 'session.status' &&
        (e.ocEvent?.properties as { status?: { type?: string } })?.status
          ?.type === 'busy'
    );
    if (hasBusy) {
      this.uiQuery.updatePart({ isOptimisticLoading: false });
    }

    // Update lastProcessedEventIndex from batch
    let maxIndex = buffer.reduce(
      (max, e) => Math.max(max, e.eventIndex),
      this.lastProcessedEventIndex
    );
    this.lastProcessedEventIndex = maxIndex;
  }
}
