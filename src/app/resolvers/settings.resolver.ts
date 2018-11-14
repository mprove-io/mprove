import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import * as constants from 'app/constants/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Injectable()
export class SettingsResolver implements Resolve<any> {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.printer.log(enums.busEnum.TEAM_RESOLVER, 'starts...');

    let userId: string;
    this.store
      .select(selectors.getUserId)
      .pipe(take(1))
      .subscribe(x => (userId = x));

    let projectId: string;
    this.store
      .select(selectors.getSelectedProjectId)
      .pipe(take(1))
      .subscribe(x => (projectId = x));

    if (projectId === constants.DEMO && userId !== 'akalitenya@mprove.io') {
      this.router.navigate(['/profile']);

      this.myDialogService.showAccessDeniedDialog({
        message: 'Settings page is not accessible on Demo project'
      });
      this.printer.log(enums.busEnum.TEAM_RESOLVER, `resolved (false)`);
      return of(false);
    }

    return true;
  }
}
