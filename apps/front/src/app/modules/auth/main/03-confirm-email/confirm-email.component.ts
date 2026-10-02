import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { EMAIL_CONFIRMATION_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_EMAIL_CONFIRMED,
  PATH_LOGIN_SUCCESS
} from '#common/constants/top';
import { LOCAL_STORAGE_TOKEN } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendConfirmUserEmailRequest } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-request';
import type { ToBackendConfirmUserEmailResponse } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-response';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { AuthService } from '#front/app/services/auth.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-confirm-email',
  templateUrl: './confirm-email.component.html'
})
export class ConfirmEmailComponent implements OnInit {
  pageTitle = EMAIL_CONFIRMATION_PAGE_TITLE;

  emailVerificationToken: string;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private userQuery: UserQuery,
    private authService: AuthService,
    private router: Router,
    private myDialogService: MyDialogService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();

    this.emailVerificationToken =
      this.route.snapshot.queryParamMap.get('token');

    let payload: ToBackendConfirmUserEmailRequest['input'] = {
      emailVerificationToken: this.emailVerificationToken
    };

    setTimeout(() => {
      this.apiService
        .req({
          route: 'api/ToBackendConfirmUserEmail',
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap((resp: ToBackendConfirmUserEmailResponse) => {
            if (resp?.type === 'Success') {
              let user = resp.output.user;
              let token = resp.output.token;

              if (isDefined(user) && isDefined(token)) {
                // first email verification
                this.myDialogService.showEmailConfirmed();
                this.userQuery.update(user);
                localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
                this.router.navigate([PATH_LOGIN_SUCCESS]);
              } else {
                // email was verified already
                this.router.navigate([PATH_EMAIL_CONFIRMED]);
              }
            }
          }),
          take(1)
        )
        .subscribe();
    }, 100); // timeout is to showSpinner after AppComponent previous NavigationEnd completed
  }
}
