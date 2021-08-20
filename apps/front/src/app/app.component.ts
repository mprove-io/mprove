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
      switch (true) {
        case x instanceof NavigationStart: {
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

    // throw new Error('appComponent ngOnInit');

    // this.myDialogService.showEditPhoto({ apiService: this.apiService });
    // this.myDialogService.showEmailConfirmed();
    // this.myDialogService.showPasswordResetSent('test123123@example.com');

    // this.myDialogService.showError({
    //   errorData: {
    //     message: '8j2jf3894fj598324fj5983724f5893j24f598j739284f57j398f'
    //   },
    //   isThrow: false
    // });
  }
}
