import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { common } from '~front/barrels/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() {}

  authenticated() {
    let jwtHelperService = new JwtHelperService();

    let token: string = localStorage.getItem('token');

    let isAuthenticated: boolean = common.isDefined(token)
      ? !jwtHelperService.isTokenExpired(token)
      : false;

    return isAuthenticated;
  }
}
