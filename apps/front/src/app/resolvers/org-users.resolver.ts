import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { USERS_PER_PAGE } from '#common/constants/top-front';
import type { ToBackendGetOrgUsersInput } from '#common/zod/backend/routes/org-users/get-org-users/get-org-users-request';
import type { ToBackendGetOrgUsersResponse } from '#common/zod/backend/routes/org-users/get-org-users/get-org-users-response';
import { checkNavOrg } from '../functions/check-nav-org';
import { NavQuery, NavState } from '../queries/nav.query';
import { UsersQuery } from '../queries/users.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class OrgUsersResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private apiService: ApiService,
    private usersQuery: UsersQuery
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

    checkNavOrg({
      router: this.router,
      route: route,
      nav: nav
    });

    let orgId;

    this.navQuery.orgId$.pipe(take(1)).subscribe(x => {
      orgId = x;
    });

    let payload: ToBackendGetOrgUsersInput = {
      orgId: orgId,
      pageNum: 1,
      perPage: USERS_PER_PAGE
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetOrgUsers',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetOrgUsersResponse) => {
          if (resp.result?.type === 'Success') {
            this.usersQuery.update({
              users: resp.result.value.orgUsersList,
              total: resp.result.value.total
            });
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
