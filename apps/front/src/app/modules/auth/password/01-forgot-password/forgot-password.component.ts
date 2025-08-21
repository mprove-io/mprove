import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { FORGOT_YOUR_PASSWORD_PAGE_TITLE } from '~common/constants/page-titles';
import { PATH_LOGIN, PATH_PASSWORD_RESET_SENT } from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendResetUserPasswordRequestPayload,
  ToBackendResetUserPasswordResponse
} from '~common/interfaces/to-backend/users/to-backend-reset-user-password';
import { ApiService } from '~front/app/services/api.service';

@Component({
  standalone: false,
  selector: 'm-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  pageTitle = FORGOT_YOUR_PASSWORD_PAGE_TITLE;

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

    this.spinner.show(APP_SPINNER_NAME);

    let email = this.resetPasswordForm.value.email;

    let payload: ToBackendResetUserPasswordRequestPayload = {
      email: email
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendResetUserPassword,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendResetUserPasswordResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            localStorage.setItem('PASSWORD_RESET_EMAIL', email);
            this.router.navigate([PATH_PASSWORD_RESET_SENT]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  backToLogin() {
    this.router.navigate([PATH_LOGIN]);
  }
}
