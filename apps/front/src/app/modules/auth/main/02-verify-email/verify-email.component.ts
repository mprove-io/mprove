import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, from, of } from 'rxjs';
import { concatMap, delay, map, startWith, take, tap } from 'rxjs/operators';
import { VERIFY_YOUR_EMAIL_ADDRESS_PAGE_TITLE } from '~common/constants/page-titles';
import { PATH_LOGIN } from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import {
  ToBackendResendUserEmailRequestPayload,
  ToBackendResendUserEmailResponse
} from '~common/interfaces/to-backend/users/to-backend-resend-user-email';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  pageTitle = VERIFY_YOUR_EMAIL_ADDRESS_PAGE_TITLE;

  userId: string;

  email$ = this.userQuery.select().pipe(
    tap(state => {
      this.userId = state.userId;
    }),
    map(state => {
      if (isUndefined(state.email)) {
        this.authService.logout();
      }
      return state.email;
    })
  );

  isResendEnabled = true;
  buttonText = 'Resend it now';

  timerSubscription: Subscription;

  constructor(
    private userQuery: UserQuery,
    private authService: AuthService,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();
    // console.log('startWatch from VerifyEmailComponent');
    // this.authService.startWatch();
  }

  resendEmail() {
    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendResendUserEmailRequestPayload = {
      userId: this.userId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendResendUserEmail,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendResendUserEmailResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let isEmailVerified = resp.payload.isEmailVerified;

            if (isEmailVerified === true) {
              this.router.navigate([PATH_LOGIN]);
            } else {
              this.spinner.hide(APP_SPINNER_NAME);
              this.startTimer();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  startTimer() {
    this.isResendEnabled = false;

    this.timerSubscription = from([4, 3, 2, 1, 0])
      .pipe(
        concatMap(v => of(v).pipe(delay(1000))),
        startWith(5),
        tap(x => {
          if (x > 0) {
            this.buttonText = `Message sent. Retry available in ${x}`;
          } else {
            this.isResendEnabled = true;
            this.buttonText = 'Resend it now';
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (isDefined(this.timerSubscription)) {
      this.timerSubscription?.unsubscribe();
      this.timerSubscription = undefined;
    }
  }
}
