import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import type { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import type { ToBackendGetRolesRequest } from '#common/types/backend/routes/roles/get-roles/get-roles-request';
import type { ToBackendGetRolesResponse } from '#common/types/backend/routes/roles/get-roles/get-roles-response';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { GivensQuery } from '../queries/givens.query';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, type NavState } from '../queries/nav.query';
import { RolesQuery } from '../queries/roles.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectRolesResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private apiService: ApiService,
    private memberQuery: MemberQuery,
    private givensQuery: GivensQuery,
    private rolesQuery: RolesQuery
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

    let getRolesPayload: ToBackendGetRolesRequest['input'] = {
      projectId: projectId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetRoles',
        payload: getRolesPayload
      })
      .pipe(
        map((resp: ToBackendGetRolesResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            let newSortedRoles = resp.output.roles.sort((a, b) =>
              a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
            );

            let newSortedGivens = resp.output.givens.sort((a, b) =>
              a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
            );

            this.rolesQuery.update({
              roles: newSortedRoles
            });

            this.givensQuery.update({
              givens: newSortedGivens
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
