import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
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
    this.clearLocalStorage();
    this.router.navigate([PATH_LOGIN]);
  }

  runCheck() {
    let locationPath = this.location.path();
    let pathArray = locationPath.split('/');

    let firstPath = pathArray[1];
    firstPath = firstPath.split('?')[0];

    if (
      [PATH_PROFILE, PATH_ORG].indexOf(firstPath) > -1 &&
      this.authenticated() === false
    ) {
      this.logout();
    } else if (
      [PATH_LOGIN, PATH_REGISTER, PATH_VERIFY_EMAIL].indexOf(firstPath) > -1 &&
      this.authenticated() === true
    ) {
      this.router.navigate([PATH_LOGIN_SUCCESS]);
    }
  }
}
