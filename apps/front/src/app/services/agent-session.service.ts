import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { exhaustMap, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
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
import { AgentEventsService } from '#front/app/services/agent-events.service';
import { ApiService } from '#front/app/services/api.service';
import { environment } from '#front/environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentSessionService {
  private isConnectingSse = false;
  private lastProcessedEventIndex = -1;
  private eventSource: EventSource;

  private sseRetryCount = 0;
  private SSE_MAX_RETRIES = 5;
  private SSE_RETRY_DELAY_MS = 3000;

  private sseEventBuffer: AgentEventApi[] = [];
  private sseRafId: number;

  private pollSubscription: Subscription;

  constructor(
    private apiService: ApiService,
    private sessionQuery: SessionQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionsQuery: SessionsQuery,
    private agentEventsService: AgentEventsService
  ) {}

  initForSession(item: { lastProcessedEventIndex: number }) {
    let { lastProcessedEventIndex } = item;

    this.sseRetryCount = 0;
    this.lastProcessedEventIndex = lastProcessedEventIndex;
    this.isConnectingSse = false;
  }

  managePollingAndSse() {
    let session = this.sessionQuery.getValue();

    if (session.status === SessionStatusEnum.New && !this.pollSubscription) {
      this.startPolling({ sessionId: session.sessionId });
    }

    if (session.status !== SessionStatusEnum.New && this.pollSubscription) {
      this.stopPolling();
    }

    if (
      session.status === SessionStatusEnum.Active &&
      !this.eventSource &&
      !this.isConnectingSse
    ) {
      this.connectSse({ sessionId: session.sessionId });
    }
  }

  destroy() {
    this.closeSse();
    this.stopPolling();
  }

  private closeSse() {
    this.flushSseBuffer();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }

    this.isConnectingSse = false;
  }

  private stopPolling() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  private startPolling(item: { sessionId: string }) {
    let { sessionId } = item;

    this.pollSubscription = interval(1000)
      .pipe(
        exhaustMap(() =>
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
              isLastErrorRecovered: resp.payload.ocSession?.isLastErrorRecovered
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
            this.connectSseWithTicket({
              sessionId: sessionId,
              sseTicket: resp.payload.sseTicket
            });
          }
          this.isConnectingSse = false;
        }),
        take(1)
      )
      .subscribe();
  }

  private connectSseWithTicket(item: { sessionId: string; sseTicket: string }) {
    let { sessionId, sseTicket } = item;

    let session = this.sessionQuery.getValue();
    if (!session?.sessionId || session.sessionId !== sessionId) {
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

      if (agentEvent.eventType === 'session.mprove-reload-session') {
        this.scheduleReconnect({ sessionId: sessionId, delay: 0 });
        return;
      }

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
      if (this.sseRetryCount >= this.SSE_MAX_RETRIES) {
        this.closeSse();
        return;
      }

      this.sseRetryCount++;
      this.scheduleReconnect({
        sessionId: sessionId,
        delay: this.SSE_RETRY_DELAY_MS
      });
    };
  }

  private scheduleReconnect(item: { sessionId: string; delay: number }) {
    let { sessionId, delay } = item;

    this.closeSse();
    this.isConnectingSse = true;

    setTimeout(() => {
      let session = this.sessionQuery.getValue();
      if (
        session?.sessionId === sessionId &&
        session?.status === SessionStatusEnum.Active
      ) {
        this.reconnectSse({ sessionId: sessionId });
      } else {
        this.isConnectingSse = false;
      }
    }, delay);
  }

  private reconnectSse(item: { sessionId: string }) {
    let { sessionId } = item;

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
              isLastErrorRecovered: resp.payload.ocSession?.isLastErrorRecovered
            });

            // Release the guard, then connect SSE directly
            this.isConnectingSse = false;
            this.connectSse({ sessionId: sessionId });
          } else {
            this.isConnectingSse = false;
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

    // Batch debug events store update
    let currentEvents = this.sessionEventsQuery.getValue().events;

    let updatedEvents = [...currentEvents, ...buffer].sort(
      (a, b) => a.eventIndex - b.eventIndex
    );
    this.sessionEventsQuery.updatePart({ events: updatedEvents });

    // Batch reducer events
    let ocEvents = buffer.filter(e => e.ocEvent).map(e => e.ocEvent);
    if (ocEvents.length > 0) {
      this.agentEventsService.applyEvents(ocEvents);
    }

    // Update lastProcessedEventIndex from batch
    let maxIndex = buffer.reduce(
      (max, e) => Math.max(max, e.eventIndex),
      this.lastProcessedEventIndex
    );
    this.lastProcessedEventIndex = maxIndex;
  }
}
