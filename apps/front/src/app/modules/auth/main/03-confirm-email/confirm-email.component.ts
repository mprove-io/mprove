import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-confirm-email',
  templateUrl: './confirm-email.component.html'
})
export class ConfirmEmailComponent implements OnInit {
  pageTitle = constants.EMAIL_CONFIRMATION_PAGE_TITLE;

  emailConfirmationToken: string;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private userStore: UserStore,
    private authService: AuthService,
    private router: Router,
    private myDialogService: MyDialogService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();
    this.authService.stopWatch();

    this.emailConfirmationToken = this.route.snapshot.queryParamMap.get(
      'token'
    );

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
        {
          token: this.emailConfirmationToken
        }
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendConfirmUserEmailResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            let token = resp.payload.token;

            if (common.isDefined(user) && common.isDefined(token)) {
              // first email verification
              this.myDialogService.showEmailConfirmed();
              this.userStore.update(user);
              this.authService.stopWatch();
              localStorage.setItem(constants.LOCAL_STORAGE_TOKEN, token);
              this.router.navigate([common.PATH_LOGIN_SUCCESS]);
            } else {
              // email was verified already
              this.router.navigate([common.PATH_EMAIL_CONFIRMED]);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
