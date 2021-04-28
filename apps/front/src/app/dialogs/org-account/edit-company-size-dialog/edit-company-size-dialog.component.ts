import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { OrgStore } from '~front/app/stores/org.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-edit-company-size-dialog',
  templateUrl: './edit-company-size-dialog.component.html'
})
export class EditCompanySizeDialogComponent implements OnInit {
  size: common.CompanySizeEnum;

  sizes = [
    common.CompanySizeEnum.OneToTen,
    common.CompanySizeEnum.TenToFifty,
    common.CompanySizeEnum.FiftyToHundred,
    common.CompanySizeEnum.HundredToFiveHundred,
    common.CompanySizeEnum.MoreThanFiveHundred
  ];

  constructor(public ref: DialogRef, private orgStore: OrgStore) {}

  ngOnInit() {
    this.size = this.ref.data.companySize;
  }

  save() {
    this.ref.close();

    let payload: apiToBackend.ToBackendSetOrgInfoRequestPayload = {
      orgId: this.ref.data.orgId,
      companySize: this.size
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendSetOrgInfoResponse) => {
          let org = resp.payload.org;
          this.orgStore.update(org);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
