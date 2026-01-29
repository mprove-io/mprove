import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { PATH_LOGIN } from '#common/constants/top';
import { AuthService } from '#front/app/services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): boolean {
    if (this.auth.authenticated()) {
      return true;
    } else {
      this.router.navigate([PATH_LOGIN]);
      return false;
    }
  }
}
