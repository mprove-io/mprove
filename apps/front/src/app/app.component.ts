import { Component, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router
} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  appSpinnerName = constants.APP_SPINNER_NAME;

  spinnerStartedTs: number;

  routerEvents$ = this.router.events.pipe(
    tap((x: any) => {
      // console.log(x);
      switch (true) {
        case x instanceof NavigationStart &&
          // x.url !== `/${common.PATH_LOGIN_SUCCESS}` &&
          x.url !== `/${common.PATH_LOGIN}` &&
          (x.url.split('/').indexOf(common.EMPTY) > -1 ||
            x.url.split('/').indexOf(common.PATH_MODEL) < 0): {
          // console.log('NavigationStart', x.url);
          this.spinnerStartedTs = Date.now();
          this.spinner.show(constants.APP_SPINNER_NAME);
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

          if (time > 0) {
            setTimeout(
              () => this.spinner.hide(constants.APP_SPINNER_NAME),
              time
            );
          } else {
            this.spinner.hide(constants.APP_SPINNER_NAME);
          }

          break;
        }
      }
    })
  );

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router // , // private myDialogService: MyDialogService, // private apiService: ApiService
  ) {}

  ngOnInit() {
    this.authService.startWatch();
  }
}
