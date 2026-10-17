import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import type { ToBackendGetConnectionsOutput } from '#common/types/backend/routes/connections/get-connections/get-connections-output';
import type { ToBackendGetConnectionsRequest } from '#common/types/backend/routes/connections/get-connections/get-connections-request';
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

    let payload: ToBackendGetConnectionsRequest['input'] = {
      projectId: projectId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetConnections',
        payload: payload
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetConnectionsOutput = resp.output;

            this.memberQuery.update(output.userMember);

            this.connectionsQuery.update({
              connections: output.connections
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
