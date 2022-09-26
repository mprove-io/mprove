import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '~front/app/services/auth.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { NavState, NavStore } from '../stores/nav.store';
import { UserStore } from '../stores/user.store';

@Injectable({ providedIn: 'root' })
export class NavBarResolver implements Resolve<Observable<boolean>> {
  tokenUserId: string;

  userUserId: string;
  userIsEmailVerified = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userQuery: UserQuery,
    private userStore: UserStore,
    private navStore: NavStore,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    if (!this.authService.authenticated()) {
      this.authService.logout();
      return of(false);
    }

    // console.log('stopWatch from NavBarResolver');
    this.authService.stopWatch();

    this.userQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.userUserId = x.userId;
        this.userIsEmailVerified = x.isEmailVerified;
      });

    this.tokenUserId = this.authService.getTokenUserId();

    if (
      this.tokenUserId === undefined
      // ||
      // (common.isDefined(this.userUserId) &&
      //   this.userUserId !== this.tokenUserId)
    ) {
      this.authService.logout();
      return of(false);
    }

    if (
      common.isDefined(this.userUserId) &&
      this.userIsEmailVerified !== true
    ) {
      this.router.navigate([common.PATH_VERIFY_EMAIL]);
      return of(false);
    }

    let payload: apiToBackend.ToBackendGetNavRequestPayload = {
      orgId: localStorage.getItem(constants.LOCAL_STORAGE_ORG_ID),
      projectId: localStorage.getItem(constants.LOCAL_STORAGE_PROJECT_ID)
    };

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetNav, payload)
      .pipe(
        map((resp: apiToBackend.ToBackendGetNavResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let {
              avatarSmall,
              avatarBig,
              orgId,
              orgOwnerId,
              orgName,
              projectId,
              projectName,
              projectDefaultBranch,
              isRepoProd,
              branchId,
              envId,
              needValidate,
              user,
              serverNowTs
            } = resp.payload;

            let nav: NavState = {
              avatarSmall,
              avatarBig,
              orgId,
              orgOwnerId,
              orgName,
              projectId,
              projectName,
              projectDefaultBranch,
              isRepoProd,
              branchId,
              envId,
              needValidate,
              serverTimeDiff: Date.now() - serverNowTs
            };

            this.navStore.update(nav);
            this.userStore.update(user);

            if (user.isEmailVerified === true) {
              // console.log('startWatch from NavBarResolver');
              this.authService.startWatch();
              return true;
            } else {
              this.router.navigate([common.PATH_VERIFY_EMAIL]);
              return false;
            }
          } else {
            return false;
          }
        })
      );
  }
}
