import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { interval as observableInterval, Subscription } from 'rxjs';
import { UserStore } from '~front/app/stores/user.store';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { UserQuery } from '../queries/user.query';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private checkAuthSubscription: Subscription;

  constructor(
    private router: Router,
    private userStore: UserStore,
    private location: Location,
    private userQuery: UserQuery
  ) {}

  authenticated() {
    let jwtHelperService = new JwtHelperService();

    let token = localStorage.getItem(constants.LOCAL_STORAGE_TOKEN);

    let isAuthenticated: boolean = common.isDefined(token)
      ? !jwtHelperService.isTokenExpired(token)
      : false;

    return isAuthenticated;
  }

  getTokenUserId() {
    let jwtHelperService = new JwtHelperService();

    let token = localStorage.getItem(constants.LOCAL_STORAGE_TOKEN);

    return jwtHelperService.decodeToken(token).userId;
  }

  clearLocalStorage() {
    localStorage.removeItem(constants.LOCAL_STORAGE_TOKEN);
    localStorage.removeItem(constants.LOCAL_STORAGE_ORG_ID);
  }

  logout() {
    this.stopWatch();
    this.clearLocalStorage();
    this.router.navigate([common.PATH_LOGIN]);
  }

  startWatch() {
    if (common.isDefined(this.checkAuthSubscription)) {
      this.stopWatch();
    }

    this.checkAuthSubscription = observableInterval(1000).subscribe(() => {
      let pathArray = this.location.path().split('/');
      let firstPath = pathArray[1];

      if (
        [common.PATH_PROFILE, common.PATH_ORG].indexOf(firstPath) > -1 &&
        !this.authenticated()
      ) {
        // console.log('[WatchAuthenticationService] logout');
        this.logout();
      } else if (
        // for other tabs
        [
          common.PATH_LOGIN,
          common.PATH_REGISTER,
          common.PATH_VERIFY_EMAIL
        ].indexOf(firstPath) > -1 &&
        this.authenticated()
      ) {
        // console.log('[WatchAuthenticationService] login success');
        this.router.navigate([common.PATH_LOGIN_SUCCESS]);
      }
    });
  }

  stopWatch() {
    if (common.isDefined(this.checkAuthSubscription)) {
      this.checkAuthSubscription.unsubscribe();
      this.checkAuthSubscription = undefined;
    }
  }
}
