import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { FORGOT_YOUR_PASSWORD_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_LOGIN, PATH_PASSWORD_RESET_SENT } from '#common/constants/top';
import type { ToBackendResetUserPasswordRequest } from '#common/types/backend/routes/users/reset-user-password/reset-user-password-request';
import { ApiService } from '#front/app/services/api.service';
import { SpinnerService } from '#front/app/services/spinner.service';

@Component({
  standalone: false,
  selector: 'm-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  pageTitle = FORGOT_YOUR_PASSWORD_PAGE_TITLE;

  resetPasswordForm: FormGroup<{
    email: FormControl<string>;
  }> = this.fb.group({
    email: this.fb.control<string>('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(255)
    ])
  });

  constructor(
    private spinnerService: SpinnerService,
    private fb: FormBuilder,
    private router: Router,
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

    let email = this.resetPasswordForm.value.email;

    let payload: ToBackendResetUserPasswordRequest['input'] = {
      email: email
    };

    this.apiService
      .req({
        route: 'api/ToBackendResetUserPassword',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          localStorage.setItem('PASSWORD_RESET_EMAIL', email);
          this.router.navigate([PATH_PASSWORD_RESET_SENT]);
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  backToLogin() {
    this.router.navigate([PATH_LOGIN]);
  }
}
