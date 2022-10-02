import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavStore } from '~front/app/stores/nav.store';
import { OrgStore } from '~front/app/stores/org.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface EditOrgOwnerDialogDataItem {
  apiService: ApiService;
  orgId: string;
  ownerEmail: string;
}

@Component({
  selector: 'm-edit-org-owner-dialog',
  templateUrl: './edit-org-owner-dialog.component.html'
})
export class EditOrgOwnerDialogComponent implements OnInit {
  editOrgOwnerForm: FormGroup;

  orgId: string;

  constructor(
    public ref: DialogRef<EditOrgOwnerDialogDataItem>,
    private fb: FormBuilder,
    private orgStore: OrgStore,
    private router: Router,
    private navStore: NavStore
  ) {}

  ngOnInit() {
    this.editOrgOwnerForm = this.fb.group({
      ownerEmail: [
        this.ref.data.ownerEmail,
        [Validators.required, Validators.email, Validators.maxLength(255)]
      ]
    });
  }

  save() {
    this.editOrgOwnerForm.markAllAsTouched();

    if (!this.editOrgOwnerForm.valid) {
      return;
    }

    this.ref.close();

    let newOwnerEmail = this.editOrgOwnerForm.value.ownerEmail;

    let payload: apiToBackend.ToBackendSetOrgOwnerRequestPayload = {
      orgId: this.ref.data.orgId,
      ownerEmail: newOwnerEmail
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendSetOrgOwnerResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let org = resp.payload.org;
            localStorage.setItem(
              constants.LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME,
              org.name
            );
            localStorage.setItem(
              constants.LOCAL_STORAGE_NEW_ORG_OWNER,
              newOwnerEmail
            );
            this.router.navigate([common.PATH_ORG_OWNER_CHANGED]);
            this.orgStore.reset();
            this.navStore.clearOrgAndDeps();
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
