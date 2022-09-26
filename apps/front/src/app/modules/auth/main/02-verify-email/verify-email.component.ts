import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { from, of, Subscription } from 'rxjs';
import { concatMap, delay, map, startWith, take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  pageTitle = constants.VERIFY_YOUR_EMAIL_ADDRESS_PAGE_TITLE;

  userId: string;

  email$ = this.userQuery.select().pipe(
    tap(state => {
      this.userId = state.userId;
    }),
    map(state => {
      if (common.isUndefined(state.email)) {
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
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();
    // console.log('startWatch from VerifyEmailComponent');
    this.authService.startWatch();
  }

  resendEmail() {
    let payload: apiToBackend.ToBackendResendUserEmailRequestPayload = {
      userId: this.userId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResendUserEmail,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendResendUserEmailResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let isEmailVerified = resp.payload.isEmailVerified;

            if (isEmailVerified === true) {
              this.router.navigate([common.PATH_LOGIN]);
            } else {
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
    if (common.isDefined(this.timerSubscription)) {
      this.timerSubscription?.unsubscribe();
      this.timerSubscription = undefined;
    }
  }
}
