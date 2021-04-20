import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
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
  constructor(
    public userQuery: UserQuery,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private myDialogService: MyDialogService
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

  editName() {
    this.myDialogService.showEditName({
      apiService: this.apiService
    });
  }

  deleteUser() {
    this.myDialogService.showDeleteUser({
      apiService: this.apiService
    });
  }
}
