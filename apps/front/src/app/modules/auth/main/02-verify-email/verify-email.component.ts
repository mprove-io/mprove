import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { from, of, Subscription } from 'rxjs';
import { concatMap, delay, map, startWith, take, tap } from 'rxjs/operators';
import { VERIFY_YOUR_EMAIL_ADDRESS_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_LOGIN } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendResendUserEmailOutput } from '#common/types/backend/routes/users/resend-user-email/resend-user-email-output';
import type { ToBackendResendUserEmailRequest } from '#common/types/backend/routes/users/resend-user-email/resend-user-email-request';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';
import { AuthService } from '#front/app/services/auth.service';

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
    private appSpinnerService: AppSpinnerService,
    private userQuery: UserQuery,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();
  }

  resendEmail() {
    let payload: ToBackendResendUserEmailRequest['input'] = {
      userId: this.userId
    };

    this.apiService
      .req({
        route: 'api/ToBackendResendUserEmail',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendResendUserEmailOutput = resp.output;

          let isEmailVerified = output.isEmailVerified;

          if (isEmailVerified === true) {
            this.router.navigate([PATH_LOGIN]);
          } else {
            this.startTimer();
          }
        }),
        take(1),
        this.appSpinnerService.track()
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
