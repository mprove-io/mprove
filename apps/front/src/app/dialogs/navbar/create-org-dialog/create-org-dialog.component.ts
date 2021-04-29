import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-create-org-dialog',
  templateUrl: './create-org-dialog.component.html'
})
export class CreateOrgDialogComponent implements OnInit {
  createOrgForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
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
        map((resp: apiToBackend.ToBackendCreateOrgResponse) => {
          // let user = resp.payload.user;
          // this.userStore.update(user);
          this.router.navigate([
            common.PATH_ORG,
            resp.payload.org.orgId,
            common.PATH_ORG_ACCOUNT
          ]);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
