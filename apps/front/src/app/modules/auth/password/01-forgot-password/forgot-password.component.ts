import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  resetPasswordForm: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(255)]
    ]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {}

  resetPassword() {
    this.resetPasswordForm.markAllAsTouched();

    if (!this.resetPasswordForm.valid) {
      return;
    }

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
          localStorage.setItem('PASSWORD_RESET_EMAIL', email);
          this.router.navigate([common.PATH_PASSWORD_RESET_SENT]);
        }),
        take(1)
      )
      .subscribe();
  }

  backToLogin() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}