import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
// import { Subscription, interval as observableInterval } from 'rxjs';
import {
  PATH_LOGIN,
  PATH_LOGIN_SUCCESS,
  PATH_ORG,
  PATH_PROFILE,
  PATH_REGISTER,
  PATH_VERIFY_EMAIL
} from '~common/constants/top';
import {
  LOCAL_STORAGE_ORG_ID,
  LOCAL_STORAGE_TOKEN
} from '~common/constants/top-front';
import { isDefined } from '~common/functions/is-defined';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // private checkAuthSubscription: Subscription;

  constructor(
    private router: Router,
    private location: Location
  ) {}

  authenticated() {
    let jwtHelperService = new JwtHelperService();

    let token = localStorage.getItem(LOCAL_STORAGE_TOKEN);

    let isAuthenticated: boolean = isDefined(token)
      ? !jwtHelperService.isTokenExpired(token)
      : false;

    return isAuthenticated;
  }

  getTokenUserId() {
    let jwtHelperService = new JwtHelperService();

    let token = localStorage.getItem(LOCAL_STORAGE_TOKEN);

    return jwtHelperService.decodeToken(token).userId;
  }

  clearLocalStorage() {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_ORG_ID);
  }

  logout() {
    // console.log('stopWatch from AuthService');
    // this.stopWatch();
    this.clearLocalStorage();
    this.router.navigate([PATH_LOGIN]);
  }

  runCheck() {
    let pathArray = this.location.path().split('/');
    let firstPath = pathArray[1];
    firstPath = firstPath.split('?')[0];

    if (
      [PATH_PROFILE, PATH_ORG].indexOf(firstPath) > -1 &&
      this.authenticated() === false
    ) {
      this.logout();
    } else if (
      // for other tabs
      [PATH_LOGIN, PATH_REGISTER, PATH_VERIFY_EMAIL].indexOf(firstPath) > -1 &&
      this.authenticated() === true
    ) {
      this.router.navigate([PATH_LOGIN_SUCCESS]);
    }
  }

  // startWatch() {
  //   if (isDefined(this.checkAuthSubscription)) {
  //     // console.log('restartWatch from AuthService - 2');
  //     this.stopWatch();
  //   }

  //   this.checkAuthSubscription = observableInterval(500).subscribe(() => {
  //     // let startTime = Date.now();
  //     // console.log(startTime);
  //     this.runCheck();
  //     // let endTime = Date.now();
  //     // console.log(endTime - startTime);
  //   });
  // }

  // stopWatch() {
  //   if (isDefined(this.checkAuthSubscription)) {
  //     this.checkAuthSubscription?.unsubscribe();
  //     this.checkAuthSubscription = undefined;
  //   }
  // }
}
