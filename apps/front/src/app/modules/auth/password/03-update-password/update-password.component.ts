import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { SET_NEW_PASSWORD_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_NEW_PASSWORD_WAS_SET } from '#common/constants/top';
import type { ToBackendUpdateUserPasswordRequest } from '#common/types/backend/routes/users/update-user-password/update-user-password-request';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';
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

  setPasswordForm: FormGroup<{
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = this.fb.group(
    {
      newPassword: this.fb.control<string>('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(255)
      ]),
      confirmPassword: this.fb.control<string>('', [Validators.required])
    },
    {
      validators: ValidationService.passwordMatchValidator
    }
  );

  constructor(
    private appSpinnerService: AppSpinnerService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
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
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          this.router.navigate([PATH_NEW_PASSWORD_WAS_SET]);
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }
}
