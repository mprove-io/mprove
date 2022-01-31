import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ApiService } from '../services/api.service';
import { UserStore } from '../stores/user.store';

@Injectable({ providedIn: 'root' })
export class ProfileResolver implements Resolve<Observable<boolean>> {
  constructor(private userStore: UserStore, private apiService: ApiService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
        {}
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetUserProfileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            this.userStore.update(user);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
