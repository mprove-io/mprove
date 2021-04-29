import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavStore } from '~front/app/stores/nav.store';
import { OrgStore } from '~front/app/stores/org.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-delete-org-dialog',
  templateUrl: './delete-org-dialog.component.html'
})
export class DeleteOrgDialogComponent {
  constructor(
    public ref: DialogRef,
    private router: Router,
    private orgStore: OrgStore,
    private navStore: NavStore
  ) {}

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
        map((resp: apiToBackend.ToBackendDeleteOrgResponse) => {
          localStorage.setItem(
            constants.LOCAL_STORAGE_ORG_NAME,
            this.ref.data.orgName
          );
          this.router.navigate([common.PATH_ORG_DELETED]);
          this.orgStore.reset();
          this.navStore.clearNavAndSkipAvatar();
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
