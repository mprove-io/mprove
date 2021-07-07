import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { getTimezoneLabelByValue } from '~common/_index';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
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
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.startWatch();
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
        map((resp: apiToBackend.ToBackendResetUserPasswordResponse) => {
          localStorage.setItem('PASSWORD_RESET_EMAIL', email);
          this.router.navigate([common.PATH_PASSWORD_RESET_SENT_AUTH]);
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

    this.myDialogService.showPhoto({
      apiService: this.apiService,
      avatarBig: avatarBig
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
