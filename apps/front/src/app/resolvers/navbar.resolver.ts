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

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetNav, {})
      .pipe(
        map((resp: apiToBackend.ToBackendGetNavResponse) => {
          let {
            avatarSmall,
            avatarBig,
            orgId,
            projectId,
            isRepoProd,
            branchId,
            user
          } = resp.payload;

          let nav: NavState = {
            avatarBig,
            avatarSmall,
            orgId,
            projectId,
            isRepoProd,
            branchId
          };

          this.navStore.update(nav);
          this.userStore.update(user);

          if (user.isEmailVerified === true) {
            return true;
          } else {
            this.router.navigate([common.PATH_VERIFY_EMAIL]);
            return false;
          }
        })
      );
  }
}
