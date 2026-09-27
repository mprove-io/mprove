import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PARAMETER_SESSION_ID } from '#common/constants/top';
import type { ToBackendGetSessionInput } from '#common/zod/backend/routes/sessions/get-session/get-session-request';
import type { ToBackendGetSessionResponse } from '#common/zod/backend/routes/sessions/get-session/get-session-response';
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

    let payload: ToBackendGetSessionInput = {
      sessionId: sessionId,
      isFetchFromOpencode: true
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetSession',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetSessionResponse) => {
          if (resp.result?.type === 'Success') {
            this.sessionEventsService.resetAll();

            if (resp.result.value.sessions.length > 0) {
              let existing = this.sessionsQuery.getValue().sessions;
              let merged = [...existing];
              resp.result.value.sessions.map(incoming => {
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
              payload: resp.result.value,
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
