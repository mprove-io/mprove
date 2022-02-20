import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { OrgStore } from '~front/app/stores/org.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-edit-phone-number-dialog',
  templateUrl: './edit-phone-number-dialog.component.html'
})
export class EditPhoneNumberDialogComponent implements OnInit {
  editPhoneNumberForm: FormGroup;

  orgId: string;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private orgStore: OrgStore
  ) {}

  ngOnInit() {
    this.editPhoneNumberForm = this.fb.group({
      contactPhone: [this.ref.data.contactPhone, [Validators.maxLength(255)]]
    });
  }

  save() {
    this.editPhoneNumberForm.markAllAsTouched();

    if (!this.editPhoneNumberForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendSetOrgInfoRequestPayload = {
      orgId: this.ref.data.orgId,
      contactPhone: this.editPhoneNumberForm.value.contactPhone
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendSetOrgInfoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let org = resp.payload.org;
            this.orgStore.update(org);
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
