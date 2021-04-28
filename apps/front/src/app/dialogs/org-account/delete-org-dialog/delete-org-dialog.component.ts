import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-delete-org-dialog',
  templateUrl: './delete-org-dialog.component.html'
})
export class DeleteOrgDialogComponent {
  constructor(public ref: DialogRef, private router: Router) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteOrgRequestPayload = {
      orgId: this.ref.data.orgId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteOrg,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendDeleteUserResponse) => {
          // this.router.navigate([common.PATH_PROFILE]);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
