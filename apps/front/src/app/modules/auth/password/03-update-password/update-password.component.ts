import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { SET_NEW_PASSWORD_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_NEW_PASSWORD_WAS_SET } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import type { ToBackendUpdateUserPasswordRequest } from '#common/types/backend/routes/users/update-user-password/update-user-password-request';
import type { ToBackendUpdateUserPasswordResponse } from '#common/types/backend/routes/users/update-user-password/update-user-password-response';
import { ApiService } from '#front/app/services/api.service';
import { AuthService } from '#front/app/services/auth.service';
import { ValidationService } from '#front/app/services/validation.service';

@Component({
  standalone: false,
  selector: 'm-update-password',
  templateUrl: './update-password.component.html'
})
export class UpdatePasswordComponent implements OnInit {
  pageTitle = SET_NEW_PASSWORD_PAGE_TITLE;

  passwordResetToken: string;

  setPasswordForm: FormGroup = this.fb.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(255)
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validator: ValidationService.passwordMatchValidator
    }
  );

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();

    this.passwordResetToken = this.route.snapshot.queryParamMap.get('token');
  }

  setPassword() {
    this.setPasswordForm.markAllAsTouched();

    if (!this.setPasswordForm.valid) {
      return;
    }

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendUpdateUserPasswordRequest['input'] = {
      passwordResetToken: this.passwordResetToken,
      newPassword: this.setPasswordForm.value.newPassword
    };

    this.apiService
      .req({
        route: 'api/ToBackendUpdateUserPassword',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendUpdateUserPasswordResponse) => {
          if (resp?.type === 'Success') {
            this.router.navigate([PATH_NEW_PASSWORD_WAS_SET]);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
