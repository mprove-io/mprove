import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-create-org-dialog',
  templateUrl: './create-org-dialog.component.html'
})
export class CreateOrgDialogComponent implements OnInit {
  createOrgForm: FormGroup;

  constructor(public ref: DialogRef, private fb: FormBuilder) {}

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
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}