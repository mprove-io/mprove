import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { map, take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-edit-name-dialog',
  templateUrl: './edit-name-dialog.component.html'
})
export class EditNameDialogComponent implements OnInit {
  editNameForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private router: Router,
    private userStore: UserStore,
    private userQuery: UserQuery,
    private authService: AuthService
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
      firstName: [firstName, [Validators.maxLength(255)]],
      lastName: [lastName, [Validators.maxLength(255)]]
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
        map((resp: apiToBackend.ToBackendSetUserNameResponse) => {
          let user = resp.payload.user;
          this.userStore.update(user);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
