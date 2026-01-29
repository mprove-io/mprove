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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendResetUserPasswordRequestPayload,
  ToBackendResetUserPasswordResponse
} from '#common/interfaces/to-backend/users/to-backend-reset-user-password';
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

    let payload: ToBackendResetUserPasswordRequestPayload = {
      email: email
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendResetUserPassword,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendResetUserPasswordResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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

  showApiKey() {
    this.myDialogService.showApiKey();
  }

  deleteUser() {
    this.myDialogService.showDeleteUser({
      apiService: this.apiService
    });
  }
}
