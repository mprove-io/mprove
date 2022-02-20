import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-create-org-dialog',
  templateUrl: './create-org-dialog.component.html'
})
export class CreateOrgDialogComponent implements OnInit {
  createOrgForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private navStore: NavStore,
    private router: Router
  ) {}

  ngOnInit() {
    let orgName: string;

    this.createOrgForm = this.fb.group({
      orgName: [orgName, [Validators.maxLength(255)]]
    });
  }

  create() {
    this.createOrgForm.markAllAsTouched();

    if (!this.createOrgForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateOrgRequestPayload = {
      name: this.createOrgForm.value.orgName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrg,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateOrgResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.router.navigate([
              common.PATH_ORG,
              resp.payload.org.orgId,
              common.PATH_ACCOUNT
            ]);

            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                projectId: undefined,
                projectName: undefined,
                isRepoProd: true,
                branchId: undefined
              })
            );

            localStorage.removeItem(constants.LOCAL_STORAGE_PROJECT_ID);
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
