import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ToBackendGetUserProfileResponse } from '#common/zod/backend/routes/users/get-user-profile/get-user-profile-response';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '../../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProfileResolver implements Resolve<Observable<boolean>> {
  constructor(
    private userQuery: UserQuery,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    return this.apiService
      .req({
        route: 'api/ToBackendGetUserProfile',
        payload: {}
      })
      .pipe(
        map((resp: ToBackendGetUserProfileResponse) => {
          if (resp?.type === 'Success') {
            let user = resp.output.user;
            this.userQuery.update(user);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
