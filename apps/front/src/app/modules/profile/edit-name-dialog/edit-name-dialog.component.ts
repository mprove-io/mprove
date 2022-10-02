import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface EditNameDialogItem {
  apiService: ApiService;
}

@Component({
  selector: 'm-edit-name-dialog',
  templateUrl: './edit-name-dialog.component.html'
})
export class EditNameDialogComponent implements OnInit {
  editNameForm: FormGroup;

  constructor(
    public ref: DialogRef<EditNameDialogItem>,
    private fb: FormBuilder,
    private userStore: UserStore,
    private userQuery: UserQuery
  ) {}

  ngOnInit() {
    let firstName: string;
    let lastName: string;

    this.userQuery
      .select()
      .pipe(
        tap(state => {
          firstName = state.firstName;
          lastName = state.lastName;
        }),
        take(1)
      )
      .subscribe();

    this.editNameForm = this.fb.group({
      firstName: [firstName, [Validators.maxLength(255), Validators.required]],
      lastName: [lastName, [Validators.maxLength(255), Validators.required]]
    });
  }

  save() {
    this.editNameForm.markAllAsTouched();

    if (!this.editNameForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendSetUserNameRequestPayload = {
      firstName: this.editNameForm.value.firstName,
      lastName: this.editNameForm.value.lastName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserName,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendSetUserNameResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            this.userStore.update(user);
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
