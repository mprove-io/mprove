import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import type { ToBackendGetConnectionsInput } from '#common/zod/backend/routes/connections/get-connections/get-connections-request';
import type { ToBackendGetConnectionsResponse } from '#common/zod/backend/routes/connections/get-connections/get-connections-response';
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

    let payload: ToBackendGetConnectionsInput = {
      projectId: projectId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetConnections',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetConnectionsResponse) => {
          if (resp.result?.type === 'Success') {
            this.memberQuery.update(resp.result.value.userMember);

            this.connectionsQuery.update({
              connections: resp.result.value.connections
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
