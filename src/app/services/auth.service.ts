import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtHelperService: JwtHelperService,
    public router: Router
  ) {}

  authenticated() {
    // Check if there's an unexpired JWT
    const token: string = localStorage.getItem('token');

    let isAuthenticated: boolean = token
      ? !this.jwtHelperService.isTokenExpired(token)
      : false;

    return isAuthenticated;
  }
}
