import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { PROFILE_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_PASSWORD_RESET_SENT_AUTH,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendDeleteUserCodexAuthOutput } from '#common/types/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-output';
import type { ToBackendGenerateUserApiKeyOutput } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-output';
import type { ToBackendResetUserPasswordRequest } from '#common/types/backend/routes/users/reset-user-password/reset-user-password-request';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UserQuery, UserState } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { SpinnerService } from '#front/app/services/spinner.service';

@Component({
  standalone: false,
  selector: 'm-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  readonly apiKeyTypePK: ApiKeyType = 'PK';

  restrictedUserAlias = RESTRICTED_USER_ALIAS;

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
    private spinnerService: SpinnerService,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private router: Router,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  changePassword() {
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
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          localStorage.setItem('PASSWORD_RESET_EMAIL', email);
          this.router.navigate([PATH_PASSWORD_RESET_SENT_AUTH]);
        }),
        take(1),
        this.spinnerService.appTrack()
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
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendGenerateUserApiKeyOutput = resp.output;

          this.userQuery.updatePart({
            apiKeyPrefix: output.apiKeyPrefix
          });
          this.myDialogService.showGeneratedApiKey({
            apiKey: output.apiKey
          });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  deleteApiKey() {
    let payload = {};

    this.apiService
      .req({
        route: 'api/ToBackendDeleteUserApiKey',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          this.userQuery.updatePart({
            apiKeyPrefix: undefined
          });
        }),
        take(1),
        this.spinnerService.appTrack()
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
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteUserCodexAuthOutput = resp.output;

          this.userQuery.update(output.user);
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }
}
