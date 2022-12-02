import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { checkNavOrg } from '../functions/check-nav-org';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { NavState } from '../stores/nav.store';
import { UsersStore } from '../stores/users.store';

@Injectable({ providedIn: 'root' })
export class OrgUsersResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private apiService: ApiService,
    private usersStore: UsersStore
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

    let payload: apiToBackend.ToBackendGetOrgUsersRequestPayload = {
      orgId: orgId,
      pageNum: 1,
      perPage: constants.USERS_PER_PAGE
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetOrgUsersResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.usersStore.update({
              users: resp.payload.orgUsersList,
              total: resp.payload.total
            });
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
