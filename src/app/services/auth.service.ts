import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as enums from 'app/enums/_index';
import * as configs from 'app/configs/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import { PrinterService } from 'app/services/printer.service';

// Avoid name not found warnings
// declare var Auth0Lock: any;
// import Auth0Lock from 'auth0-lock';
const auth0Lock: any = require('auth0-lock').default;


const host = window.location.host;
const protocol = window.location.protocol;

@Injectable()
export class AuthService {

  // Configure Auth0
  lock: any;

  private lockAuthenticated: Subject<void> = new Subject<void>();

  constructor(
    private printer: PrinterService,
    private jwtHelperService: JwtHelperService,
    public router: Router,
    private store: Store<interfaces.AppState>) {

    this.restartLock();
  }

  restartLock() {
    this.lock = new auth0Lock(
      configs.authConfig.clientID,
      configs.authConfig.domain,
      configs.authConfig.options,
    );

    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', (authResult: any) => {
      this.lockAuthenticated.next(null);

      localStorage.setItem('token', authResult.idToken);

      this.printer.log(enums.busEnum.AUTH_SERVICE, 'getting State...');
      this.store.dispatch(new actions.ResetStateAction());
      this.store.dispatch(new actions.GetStateAction({ empty: true }));

      /* manually hide Auth0Lock window */
      // this.lock.hide();

      this.store.select(selectors.getUserLoaded).pipe(
        filter(loaded => !!loaded),
        take(1))
        .subscribe(x => this.reNavigate());

    });

    this.lock.on('authorization_error', (error: any) => {
      // console.log(error); // TODO: handle authorization_error
    });
  }

  getLockAuthenticated(): Observable<void> {
    return this.lockAuthenticated.asObservable();
  }

  login() {
    this.restartLock();

    // Call the show method to display the widget.
    this.lock.show();
  }

  authenticated() {
    // Check if there's an unexpired JWT
    const token: string = localStorage.getItem('token');

    return token ? !this.jwtHelperService.isTokenExpired(token) : false;
  }

  private reNavigate() {
    /* redirect user to the redirect_url */
    let redirectUrl: string = localStorage.getItem('redirect_url');
    this.printer.log(enums.busEnum.AUTH_SERVICE, 'got redirect_url from LocalStorage:', redirectUrl);

    if (redirectUrl) {
      this.printer.log(enums.busEnum.AUTH_SERVICE, 'navigating redirect_url...');
      this.router.navigate([redirectUrl]);

    } else {
      this.printer.log(enums.busEnum.AUTH_SERVICE, 'navigating profile...');
      this.router.navigate(['profile']);
    }
  }

}
