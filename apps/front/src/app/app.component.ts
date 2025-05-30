import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule
} from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, NgxSpinnerModule, CommonModule],
  standalone: true
})
export class AppComponent implements OnInit {
  appSpinnerName = constants.APP_SPINNER_NAME;

  spinnerStartedTs: number;

  isSpinnerScheduledToHide = false;

  routerEvents$ = this.router.events.pipe(
    tap((x: any) => {
      // console.log(x);
      switch (true) {
        case x instanceof NavigationStart: {
          let urlPart = x.url.split('?')[0];
          let urlPartArray = urlPart.split('/');

          this.spinnerStartedTs = Date.now();

          if (
            urlPartArray.indexOf(common.PATH_REGISTER) !== 1 &&
            urlPartArray.indexOf(common.PATH_VERIFY_EMAIL) !== 1 &&
            urlPartArray.indexOf(common.PATH_CONFIRM_EMAIL) !== 1 &&
            urlPartArray.indexOf(common.PATH_EMAIL_CONFIRMED) !== 1 &&
            urlPartArray.indexOf(common.PATH_COMPLETE_REGISTRATION) !== 1 &&
            urlPartArray.indexOf(common.PATH_LOGIN) !== 1 &&
            urlPartArray.indexOf(common.PATH_USER_DELETED) !== 1 &&
            urlPartArray.indexOf(common.PATH_FORGOT_PASSWORD) !== 1 &&
            urlPartArray.indexOf(common.PATH_PASSWORD_RESET_SENT) !== 1 &&
            urlPartArray.indexOf(common.PATH_UPDATE_PASSWORD) !== 1 &&
            urlPartArray.indexOf(common.PATH_LOGIN_SUCCESS) !== 1 &&
            urlPartArray.indexOf(common.PATH_NEW_PASSWORD_WAS_SET) !== 1

            // urlPartArray.indexOf(common.PATH_PASSWORD_RESET_SENT_AUTH) !== 1 &&
          ) {
            // console.log('NavigationStart', x.url);

            // console.log('start');
            // console.log(Date.now());
            this.isSpinnerScheduledToHide = false;

            this.spinner.show(constants.APP_SPINNER_NAME);
          }
          break;
        }

        case x instanceof NavigationEnd ||
          x instanceof NavigationCancel ||
          x instanceof NavigationError: {
          // console.log('NavigationFinish', x.url);

          let navigationEndedTs = Date.now();

          let spinTimeAlready = navigationEndedTs - this.spinnerStartedTs;
          // console.log('spinTimeAlready:', spinTimeAlready);

          let time = constants.MIN_TIME_TO_SPIN - spinTimeAlready;
          // console.log('time:', time);

          if (x.url.split('/last-selected?').length === 1) {
            // console.log(x.url);

            if (time > 0) {
              setTimeout(
                () => this.spinner.hide(constants.APP_SPINNER_NAME),
                time
              );
            } else {
              this.isSpinnerScheduledToHide = true;
              // console.log('set');
              // console.log(Date.now());

              setTimeout(() => {
                // console.log('check');
                // console.log(Date.now());
                if (this.isSpinnerScheduledToHide === true) {
                  this.spinner.hide(constants.APP_SPINNER_NAME);
                }
              }, 30);
            }
          }

          break;
        }
      }
    })
  );

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    // console.log('startWatch from AppComponent');
    this.authService.startWatch();
  }
}
