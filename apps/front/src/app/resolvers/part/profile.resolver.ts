import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ToBackendGetUserProfileOutput } from '#common/types/backend/routes/users/get-user-profile/get-user-profile-output';
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
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetUserProfileOutput = resp.output;

            let user = output.user;
            this.userQuery.update(user);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
