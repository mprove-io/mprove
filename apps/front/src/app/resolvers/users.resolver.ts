import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { constants } from '~front/barrels/constants';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { UsersStore } from '../stores/users.store';

@Injectable({ providedIn: 'root' })
export class UsersResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private usersStore: UsersStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
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
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetOrgUsersResponse) => {
          this.usersStore.update({
            users: resp.payload.orgUsersList,
            total: resp.payload.total
          });
          return true;
        })
      );
  }
}
