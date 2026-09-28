import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { PROFILE_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_PASSWORD_RESET_SENT_AUTH,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import type { ToBackendDeleteUserApiKeyResponse } from '#common/zod/backend/routes/users/delete-user-api-key/delete-user-api-key-response';
import type { ToBackendDeleteUserCodexAuthResponse } from '#common/zod/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-response';
import type { ToBackendGenerateUserApiKeyResponse } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-response';
import type { ToBackendResetUserPasswordRequest } from '#common/zod/backend/routes/users/reset-user-password/reset-user-password-request';
import type { ToBackendResetUserPasswordResponse } from '#common/zod/backend/routes/users/reset-user-password/reset-user-password-response';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UserQuery, UserState } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  restrictedUserAlias = RESTRICTED_USER_ALIAS;
  apiKeyTypeEnum = ApiKeyTypeEnum;

  pageTitle = PROFILE_PAGE_TITLE;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
      this.cd.detectChanges();
    })
  );

  userFullName: string;
  userFullName$ = this.userQuery.fullName$.pipe(
    tap(x => {
      this.userFullName = x;
      this.cd.detectChanges();
    })
  );

  userInitials: string;
  userInitials$ = this.userQuery.initials$.pipe(
    tap(x => {
      this.userInitials = x;
      this.cd.detectChanges();
    })
  );

  apiKeyPrefix: string;
  apiKeyPrefix$ = this.userQuery.apiKeyPrefix$.pipe(
    tap(x => {
      this.apiKeyPrefix = x;
      this.cd.detectChanges();
    })
  );

  isCodexAuthSet: boolean;
  isCodexAuthSet$ = this.userQuery.isCodexAuthSet$.pipe(
    tap(x => {
      this.isCodexAuthSet = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  changePassword() {
    this.spinner.show(APP_SPINNER_NAME);

    let email: string;
    this.userQuery.email$.pipe(take(1)).subscribe(x => (email = x));

    let payload: ToBackendResetUserPasswordRequest['input'] = {
      email: email
    };

    this.apiService
      .req({
        route: 'api/ToBackendResetUserPassword',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendResetUserPasswordResponse) => {
          if (resp?.type === 'Success') {
            localStorage.setItem('PASSWORD_RESET_EMAIL', email);
            this.router.navigate([PATH_PASSWORD_RESET_SENT_AUTH]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  showPhoto() {
    this.myDialogService.showPhoto({
      avatar: this.navQuery.getValue().avatarBig,
      initials: this.userInitials
    });
  }

  editPhoto() {
    this.myDialogService.showEditPhoto({
      apiService: this.apiService
    });
  }

  editName() {
    this.myDialogService.showEditName({
      apiService: this.apiService
    });
  }

  generateApiKey() {
    let payload = {};

    this.apiService
      .req({
        route: 'api/ToBackendGenerateUserApiKey',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendGenerateUserApiKeyResponse) => {
          if (resp?.type === 'Success') {
            this.userQuery.updatePart({
              apiKeyPrefix: resp.output.apiKeyPrefix
            });
            this.myDialogService.showGeneratedApiKey({
              apiKey: resp.output.apiKey
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteApiKey() {
    let payload = {};

    this.apiService
      .req({
        route: 'api/ToBackendDeleteUserApiKey',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteUserApiKeyResponse) => {
          if (resp?.type === 'Success') {
            this.userQuery.updatePart({
              apiKeyPrefix: undefined
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteUser() {
    this.myDialogService.showDeleteUser({
      apiService: this.apiService
    });
  }

  setCodexAuth() {
    this.myDialogService.showSetCodexAuth({
      apiService: this.apiService
    });
  }

  deleteCodexAuth() {
    let payload = {};

    this.apiService
      .req({
        route: 'api/ToBackendDeleteUserCodexAuth',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteUserCodexAuthResponse) => {
          if (resp?.type === 'Success') {
            this.userQuery.update(resp.output.user);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
