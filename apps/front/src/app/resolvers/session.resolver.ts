import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PARAMETER_SESSION_ID } from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAgentSessionRequestPayload,
  ToBackendGetAgentSessionResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import { SessionsQuery } from '../queries/sessions.query';
import { AgentEventsService } from '../services/agent-events.service';
import { AgentSessionService } from '../services/agent-session.service';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class SessionResolver {
  constructor(
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private agentEventsService: AgentEventsService,
    private agentSessionService: AgentSessionService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let sessionId = route.params[PARAMETER_SESSION_ID];

    let payload: ToBackendGetAgentSessionRequestPayload = {
      sessionId: sessionId
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetAgentSession,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetAgentSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.agentEventsService.resetAll();

            if (resp.payload.sessions.length > 0) {
              let existing = this.sessionsQuery.getValue().sessions;
              let merged = [...existing];
              resp.payload.sessions.map(incoming => {
                let idx = merged.findIndex(
                  s => s.sessionId === incoming.sessionId
                );
                if (idx >= 0) {
                  merged[idx] = incoming;
                } else {
                  merged.push(incoming);
                }
              });
              this.sessionsQuery.updatePart({
                sessions: merged,
                isListLoaded: true
              });
            }

            this.agentSessionService.applySessionResponse({
              payload: resp.payload,
              withOptimisticMerge: false
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
