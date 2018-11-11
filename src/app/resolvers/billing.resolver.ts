import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import * as enums from 'src/app/enums/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';
import * as services from 'src/app/services/_index';

@Injectable()
export class BillingResolver implements Resolve<any> {

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
    private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.printer.log(enums.busEnum.BILLING_RESOLVER, 'starts...');

    let userIsAdmin: boolean;
    this.store.select(selectors.getSelectedProjectUserIsAdmin)
      .pipe(take(1))
      .subscribe(x => userIsAdmin = x);

    if (!userIsAdmin) {
      this.router.navigate(['/profile']);

      this.myDialogService.showAccessDeniedDialog({ message: 'Only project admins can access billing page' });
      this.printer.log(enums.busEnum.BILLING_RESOLVER, `resolved (false)`);
      return of(false);
    }

    return true;
  }
}
