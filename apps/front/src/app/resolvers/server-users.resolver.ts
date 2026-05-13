import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { USERS_PER_PAGE } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetServerUsersRequestPayload,
  ToBackendGetServerUsersResponse
} from '#common/zod/to-backend/users/to-backend-get-server-users';
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
    let payload: ToBackendGetServerUsersRequestPayload = {
      pageNum: 1,
      perPage: USERS_PER_PAGE
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetServerUsers,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetServerUsersResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.serverUsersQuery.update({
              serverUsers: resp.payload.serverUsersList,
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
