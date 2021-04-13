import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): boolean {
    if (this.auth.authenticated()) {
      return true;
    } else {
      this.router.navigate([common.PATH_LOGIN]);
      return false;
    }
  }
}
