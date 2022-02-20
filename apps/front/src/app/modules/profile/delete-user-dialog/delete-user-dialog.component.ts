import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html'
})
export class DeleteUserDialogComponent {
  constructor(public ref: DialogRef, private router: Router) {}

  delete() {
    this.ref.close();

    let payload = {};

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteUser,
        payload
      )
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
