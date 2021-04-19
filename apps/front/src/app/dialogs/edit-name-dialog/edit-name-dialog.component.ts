import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-edit-name-dialog',
  templateUrl: './edit-name-dialog.component.html'
})
export class EditNameDialogComponent {
  editNameForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.maxLength(255)]],
    lastName: ['', [Validators.maxLength(255)]]
  });

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private router: Router,
    private userStore: UserStore,
    private authService: AuthService
  ) {}

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

  onOk() {
    this.ref.close();
  }
}
