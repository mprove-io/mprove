import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  pageTitle = constants.FORGOT_YOUR_PASSWORD_PAGE_TITLE;

  resetPasswordForm: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(255)]
    ]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  resetPassword() {
    this.resetPasswordForm.markAllAsTouched();

    if (!this.resetPasswordForm.valid) {
      return;
    }

    this.spinner.show(constants.APP_SPINNER_NAME);

    let email = this.resetPasswordForm.value.email;

    let payload: apiToBackend.ToBackendResetUserPasswordRequestPayload = {
      email: email
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendResetUserPasswordResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            localStorage.setItem('PASSWORD_RESET_EMAIL', email);
            this.router.navigate([common.PATH_PASSWORD_RESET_SENT]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  backToLogin() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}
