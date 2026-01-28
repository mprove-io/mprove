import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetConnectionsRequestPayload,
  ToBackendGetConnectionsResponse
} from '#common/interfaces/to-backend/connections/to-backend-get-connections';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { ConnectionsQuery } from '../queries/connections.query';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectConnectionsResolver
  implements Resolve<Observable<boolean>>
{
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberQuery: MemberQuery,
    private router: Router,
    private connectionsQuery: ConnectionsQuery
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    checkNavOrgProject({
      router: this.router,
      route: route,
      nav: nav
    });

    let projectId;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: ToBackendGetConnectionsRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnections,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetConnectionsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.connectionsQuery.update({
              connections: resp.payload.connections
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
