import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { PrinterService } from 'src/app/services/printer.service';
import * as actions from 'src/app/store/actions/_index';
import * as enums from 'src/app/enums/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Injectable()
export class StateResolver implements Resolve<Observable<boolean>> {
  tokenEmail: string;

  userId: string;

  constructor(
    private printer: PrinterService,
    private jwtHelperService: JwtHelperService,
    private store: Store<interfaces.AppState>,
    private auth: AuthService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.printer.log(enums.busEnum.STATE_RESOLVER, `starts...`);

    this.store.select(selectors.getUserId)
      .pipe(take(1))
      .subscribe(x => this.userId = x);

    if (!this.auth.authenticated()) {
      this.printer.log(enums.busEnum.STATE_RESOLVER, `not authenticated, resolved (true)`);
      return of(true);
    }

    this.tokenEmail = this.getTokenEmail();

    if (this.tokenEmail === undefined) {
      this.printer.log(enums.busEnum.STATE_RESOLVER, `JWT does not contain email, dispatching Logout...`);
      this.store.dispatch(new actions.LogoutUserAction({ empty: true }));
      this.printer.log(enums.busEnum.STATE_RESOLVER, `resolved (false)`);
      return of(false);
    }

    if (this.userId !== this.tokenEmail) {
      this.printer.log(enums.busEnum.STATE_RESOLVER, `userId: ${this.userId}`);
      this.printer.log(enums.busEnum.STATE_RESOLVER, `tokenEmail: ${this.tokenEmail}`);
      this.printer.log(
        enums.busEnum.STATE_RESOLVER, `authenticated, but user_id undefined or mismatch, getting State...`
      );
      this.store.dispatch(new actions.ResetStateAction());
      this.store.dispatch(new actions.GetStateAction({ empty: true }));

      return this.waitForUserStateToLoad();

    } else {
      this.printer.log(enums.busEnum.STATE_RESOLVER, `authenticated, user_id match, resolved (true)`);
      return of(true);
    }

  }

  /**
   * This method creates an observable that waits for the `loaded` property
   * of the User state to turn `true`, emitting one time once loading
   * has finished.
   */
  waitForUserStateToLoad(): Observable<boolean> {
    return this.store.select(selectors.getUserLoaded)
      .pipe(
        filter(loaded => loaded),
        tap(() => this.printer.log(enums.busEnum.STATE_RESOLVER, `state loaded, resolved (true)`)),
        take(1)
      );
  }

  getTokenEmail() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.printer.log(enums.busEnum.STATE_RESOLVER_JWT, 'empty token');
      return 'emptyToken';
    }

    this.printer.log(
      enums.busEnum.STATE_RESOLVER_JWT, `decodeToken result:`,
      this.jwtHelperService.decodeToken(token)
    );

    this.printer.log(
      enums.busEnum.STATE_RESOLVER_JWT, `getTokenExpirationDate result:`,
      this.jwtHelperService.getTokenExpirationDate(token));

    this.printer.log(
      enums.busEnum.STATE_RESOLVER_JWT, `isTokenExpired result:`,
      this.jwtHelperService.isTokenExpired(token));

    return this.jwtHelperService.decodeToken(token).email;
  }

}
