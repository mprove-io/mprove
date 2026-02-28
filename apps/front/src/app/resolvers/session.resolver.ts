import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import type { SessionStatus } from '@opencode-ai/sdk/v2';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PARAMETER_SESSION_ID } from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAgentSessionRequestPayload,
  ToBackendGetAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import { groupPartsByMessageId } from '../functions/group-parts-by-message-id';
import { SessionQuery } from '../queries/session.query';
import { SessionBundleQuery } from '../queries/session-bundle.query';
import { SessionEventsQuery } from '../queries/session-events.query';
import { SessionsQuery } from '../queries/sessions.query';
import { ApiService } from '../services/api.service';
import { EventReducerService } from '../services/event-reducer.service';

@Injectable({ providedIn: 'root' })
export class SessionResolver {
  constructor(
    private apiService: ApiService,
    private sessionQuery: SessionQuery,
    private sessionsQuery: SessionsQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private eventReducerService: EventReducerService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let sessionId = route.params[PARAMETER_SESSION_ID];

    let payload: ToBackendGetAgentSessionRequestPayload = {
      sessionId: sessionId,
      includeMessagesAndParts: true
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetAgentSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.eventReducerService.resetAll();

            this.sessionQuery.update(resp.payload.session);

            let sessions = this.sessionsQuery.getValue().sessions;
            let found = sessions.some(
              s => s.sessionId === resp.payload.session.sessionId
            );
            this.sessionsQuery.update({
              sessions: found
                ? sessions.map(s =>
                    s.sessionId === resp.payload.session.sessionId
                      ? resp.payload.session
                      : s
                  )
                : [resp.payload.session, ...sessions]
            });

            this.sessionEventsQuery.updatePart({
              events: resp.payload.events
            });

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

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
