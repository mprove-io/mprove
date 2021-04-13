import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  resetPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private myDialogService: MyDialogService
  ) {}

  resetPassword() {
    let email = this.resetPasswordForm.value.email;

    let payload: apiToBackend.ToBackendResetUserPasswordRequestPayload = {
      email: email
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendResetUserPasswordResponse) => {
          localStorage.setItem('passwordResetEmail', email);
          this.router.navigate([constants.PATH_PASSWORD_RESET_SENT]);
        }),
        take(1)
      )
      .subscribe();
  }

  backToLogin() {
    this.router.navigate([constants.PATH_LOGIN]);
  }
}
