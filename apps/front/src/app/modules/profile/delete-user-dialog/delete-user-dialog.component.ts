import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteUserDialogItem {
  apiService: ApiService;
}

@Component({
  selector: 'm-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html'
})
export class DeleteUserDialogComponent {
  constructor(
    public ref: DialogRef<DeleteUserDialogItem>,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  delete() {
    this.spinner.show(constants.APP_SPINNER_NAME);

    this.ref.close();

    let payload = {};

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteUser,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteUserResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.router.navigate([common.PATH_USER_DELETED]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
