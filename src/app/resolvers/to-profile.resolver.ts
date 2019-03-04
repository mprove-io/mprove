import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import * as enums from '@app/enums/_index';
import * as services from '@app/services/_index';

@Injectable()
export class ToProfileResolver implements Resolve<boolean> {
  constructor(
    private printer: services.PrinterService,
    private auth: services.AuthService,
    private router: Router
  ) {}

  resolve(
    next: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ) {
    this.printer.log(enums.busEnum.TO_PROFILE_RESOLVER, 'starts...');

    if (!this.auth.authenticated()) {
      this.printer.log(
        enums.busEnum.TO_PROFILE_RESOLVER,
        'not authenticated, resolved (true)'
      );
      return true;
    } else {
      this.printer.log(
        enums.busEnum.TO_PROFILE_RESOLVER,
        'authenticated, navigating profile...'
      );

      this.router.navigate(['profile']);
      this.printer.log(enums.busEnum.TO_PROFILE_RESOLVER, 'resolved (false)');
      return false;
    }
  }
}
