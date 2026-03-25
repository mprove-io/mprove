import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PARAMETER_SESSION_ID } from '#common/constants/top';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetSessionRequestPayload,
  ToBackendGetSessionResponse
} from '#common/interfaces/to-backend/sessions/to-backend-get-session';
import { SessionsQuery } from '../queries/sessions.query';
import { ApiService } from '../services/api.service';
import { SessionService } from '../services/session.service';
import { SessionEventsService } from '../services/session-events.service';

@Injectable({ providedIn: 'root' })
export class SessionResolver {
  constructor(
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery,
    private sessionEventsService: SessionEventsService,
    private sessionService: SessionService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let sessionId = route.params[PARAMETER_SESSION_ID];

    let payload: ToBackendGetSessionRequestPayload = {
      sessionId: sessionId,
      isFetchFromOpencode: true
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetSession,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetSessionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.sessionEventsService.resetAll();

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

            this.sessionService.applySessionResponse({
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
