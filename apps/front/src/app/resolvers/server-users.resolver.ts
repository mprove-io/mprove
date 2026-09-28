import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { USERS_PER_PAGE } from '#common/constants/top-front';
import type { ToBackendGetServerUsersRequest } from '#common/zod/backend/routes/users/get-server-users/get-server-users-request';
import type { ToBackendGetServerUsersResponse } from '#common/zod/backend/routes/users/get-server-users/get-server-users-response';
import { ServerUsersQuery } from '../queries/server-users.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ServerUsersResolver implements Resolve<Observable<boolean>> {
  constructor(
    private serverUsersQuery: ServerUsersQuery,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let payload: ToBackendGetServerUsersRequest['input'] = {
      pageNum: 1,
      perPage: USERS_PER_PAGE
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetServerUsers',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetServerUsersResponse) => {
          if (resp?.type === 'Success') {
            this.serverUsersQuery.update({
              serverUsers: resp.output.serverUsersList,
              total: resp.output.total
            });
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
