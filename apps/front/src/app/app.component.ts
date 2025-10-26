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
import {
  PATH_COMPLETE_REGISTRATION,
  PATH_CONFIRM_EMAIL,
  PATH_EMAIL_CONFIRMED,
  PATH_FORGOT_PASSWORD,
  PATH_LOGIN,
  PATH_NEW_PASSWORD_WAS_SET,
  PATH_PASSWORD_RESET_SENT,
  PATH_REGISTER,
  PATH_UPDATE_PASSWORD,
  PATH_USER_DELETED,
  PATH_VERIFY_EMAIL
} from '~common/constants/top';
import {
  APP_SPINNER_NAME,
  MIN_TIME_TO_SPIN
} from '~common/constants/top-front';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, NgxSpinnerModule, CommonModule],
  standalone: true
})
export class AppComponent implements OnInit {
  appSpinnerName = APP_SPINNER_NAME;

  spinnerStartedTs: number;

  isSpinnerScheduledToHide = false;

  routerEvents$ = this.router.events.pipe(
    tap((x: any) => {
      switch (true) {
        case x instanceof NavigationStart: {
          let urlPart = x.url.split('?')[0];
          let urlPartArray = urlPart.split('/');

          this.spinnerStartedTs = Date.now();

          if (
            urlPartArray.indexOf(PATH_REGISTER) !== 1 &&
            urlPartArray.indexOf(PATH_VERIFY_EMAIL) !== 1 &&
            urlPartArray.indexOf(PATH_CONFIRM_EMAIL) !== 1 &&
            urlPartArray.indexOf(PATH_EMAIL_CONFIRMED) !== 1 &&
            urlPartArray.indexOf(PATH_COMPLETE_REGISTRATION) !== 1 &&
            urlPartArray.indexOf(PATH_LOGIN) !== 1 &&
            urlPartArray.indexOf(PATH_USER_DELETED) !== 1 &&
            urlPartArray.indexOf(PATH_FORGOT_PASSWORD) !== 1 &&
            urlPartArray.indexOf(PATH_PASSWORD_RESET_SENT) !== 1 &&
            urlPartArray.indexOf(PATH_UPDATE_PASSWORD) !== 1 &&
            urlPartArray.indexOf(PATH_NEW_PASSWORD_WAS_SET) !== 1
          ) {
            this.isSpinnerScheduledToHide = false;

            this.spinner.show(APP_SPINNER_NAME);
          }
          break;
        }

        case x instanceof NavigationEnd ||
          x instanceof NavigationCancel ||
          x instanceof NavigationError: {
          let navigationEndedTs = Date.now();

          let spinTimeAlready = navigationEndedTs - this.spinnerStartedTs;

          let time = MIN_TIME_TO_SPIN - spinTimeAlready;

          if (x.url.split('/last-selected?').length === 1) {
            if (time > 0) {
              setTimeout(() => this.spinner.hide(APP_SPINNER_NAME), time);
            } else {
              this.isSpinnerScheduledToHide = true;

              setTimeout(() => {
                if (this.isSpinnerScheduledToHide === true) {
                  this.spinner.hide(APP_SPINNER_NAME);
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
    setTimeout(() => {
      this.authService.runCheck();
    }, 0); // setTimeout is for runCheck's this.location.path to have '/'
  }
}
