import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAgentSessionsListRequestPayload,
  ToBackendGetAgentSessionsListResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-sessions-list';
import { NavQuery } from '../queries/nav.query';
import { SessionsQuery } from '../queries/sessions.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectSessionsResolver {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private sessionsQuery: SessionsQuery
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let projectId: string;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: ToBackendGetAgentSessionsListRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetAgentSessionsList,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetAgentSessionsListResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.sessionsQuery.update({
              sessions: resp.payload.sessions
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
