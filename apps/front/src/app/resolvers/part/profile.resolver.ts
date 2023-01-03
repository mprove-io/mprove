import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ApiService } from '../../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProfileResolver implements Resolve<Observable<boolean>> {
  constructor(private userQuery: UserQuery, private apiService: ApiService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
        payload: {}
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetUserProfileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            this.userQuery.update(user);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
