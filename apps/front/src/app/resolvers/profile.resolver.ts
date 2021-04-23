import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { ApiService } from '../services/api.service';
import { NavStore } from '../stores/nav.store';
import { UserStore } from '../stores/user.store';

@Injectable({ providedIn: 'root' })
export class ProfileResolver implements Resolve<Observable<boolean>> {
  constructor(
    private userStore: UserStore,
    private navStore: NavStore,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    // let userId: string;

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
        {}
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetUserProfileResponse) => {
          let user = resp.payload.user;
          this.userStore.update(user);
          return user.userId;
        }),
        switchMap((userId: string) =>
          this.apiService
            .req(
              apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig,
              <apiToBackend.ToBackendGetAvatarBigRequestPayload>{
                avatarUserId: userId
              }
            )
            .pipe(
              map((resp: apiToBackend.ToBackendGetAvatarBigResponse) => {
                this.navStore.update(state =>
                  Object.assign({}, state, {
                    avatarSmall: resp.payload.avatarSmall,
                    avatarBig: resp.payload.avatarBig
                  })
                );
                return true;
              })
            )
        )
      );
  }
}
