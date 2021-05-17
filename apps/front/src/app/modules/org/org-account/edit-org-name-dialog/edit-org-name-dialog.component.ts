import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { OrgStore } from '~front/app/stores/org.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-edit-org-name-dialog',
  templateUrl: './edit-org-name-dialog.component.html'
})
export class EditOrgNameDialogComponent implements OnInit {
  editOrgNameForm: FormGroup;

  orgId: string;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private orgStore: OrgStore,
    private navStore: NavStore
  ) {}

  ngOnInit() {
    this.editOrgNameForm = this.fb.group({
      orgName: [this.ref.data.orgName, [Validators.maxLength(255)]]
    });
  }

  save() {
    this.editOrgNameForm.markAllAsTouched();

    if (!this.editOrgNameForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendSetOrgInfoRequestPayload = {
      orgId: this.ref.data.orgId,
      name: this.editOrgNameForm.value.orgName
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
          this.navStore.update(state =>
            Object.assign({}, state, <NavState>{
              orgId: org.orgId,
              orgName: org.name
            })
          );
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
