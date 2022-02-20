import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { getTimezoneLabelByValue } from '~common/_index';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  pageTitle = constants.PROFILE_PAGE_TITLE;

  userTimezoneLabel: string;

  userTimezone$ = this.userQuery.timezone$.pipe(
    tap(x => {
      this.userTimezoneLabel = getTimezoneLabelByValue(x);
      this.cd.detectChanges();
    })
  );

  constructor(
    public userQuery: UserQuery,
    public navQuery: NavQuery,
    private authService: AuthService,
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

    let payload: apiToBackend.ToBackendResetUserPasswordRequestPayload = {
      email: email
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendResetUserPasswordResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            localStorage.setItem('PASSWORD_RESET_EMAIL', email);
            this.router.navigate([common.PATH_PASSWORD_RESET_SENT_AUTH]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  showPhoto() {
    let avatarBig: string;

    this.navQuery.avatarBig$
      .pipe(
        tap(x => (avatarBig = x)),
        take(1)
      )
      .subscribe();

    let initials: string;
    this.userQuery.initials$
      .pipe(
        tap(x => (initials = x)),
        take(1)
      )
      .subscribe();

    this.myDialogService.showPhoto({
      apiService: this.apiService,
      avatarBig: avatarBig,
      initials: initials
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

  editTimezone() {
    this.myDialogService.showEditTimezone({
      apiService: this.apiService
    });
  }

  deleteUser() {
    this.myDialogService.showDeleteUser({
      apiService: this.apiService
    });
  }
}
