import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { EMAIL_CONFIRMATION_PAGE_TITLE } from '~common/constants/page-titles';
import {
  PATH_EMAIL_CONFIRMED,
  PATH_LOGIN_SUCCESS
} from '~common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_TOKEN
} from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { ToBackendConfirmUserEmailResponse } from '~common/interfaces/to-backend/users/to-backend-confirm-user-email';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-confirm-email',
  templateUrl: './confirm-email.component.html'
})
export class ConfirmEmailComponent implements OnInit {
  pageTitle = EMAIL_CONFIRMATION_PAGE_TITLE;

  emailConfirmationToken: string;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private userQuery: UserQuery,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private myDialogService: MyDialogService,
    private title: Title
  ) {}

  ngOnInit() {
    this.spinner.show(APP_SPINNER_NAME);

    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();
    // console.log('stopWatch from ConfirmEmailComponent');
    this.authService.stopWatch();

    this.emailConfirmationToken =
      this.route.snapshot.queryParamMap.get('token');

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
        payload: {
          token: this.emailConfirmationToken
        }
      })
      .pipe(
        tap((resp: ToBackendConfirmUserEmailResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            let token = resp.payload.token;

            if (isDefined(user) && isDefined(token)) {
              // first email verification
              this.myDialogService.showEmailConfirmed();
              this.userQuery.update(user);
              // console.log('stopWatch from ConfirmEmailComponent - 2');
              this.authService.stopWatch();
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
  }
}
