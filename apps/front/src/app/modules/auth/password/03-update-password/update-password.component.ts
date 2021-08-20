import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-update-password',
  templateUrl: './update-password.component.html'
})
export class UpdatePasswordComponent implements OnInit {
  pageTitle = constants.SET_NEW_PASSWORD_PAGE_TITLE;

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
    private router: Router,
    private route: ActivatedRoute,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.passwordResetToken = this.route.snapshot.queryParamMap.get('token');
  }

  setPassword() {
    this.setPasswordForm.markAllAsTouched();

    if (!this.setPasswordForm.valid) {
      return;
    }

    let payload: apiToBackend.ToBackendUpdateUserPasswordRequestPayload = {
      passwordResetToken: this.passwordResetToken,
      newPassword: this.setPasswordForm.value.newPassword
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendUpdateUserPasswordResponse) => {
          this.router.navigate([common.PATH_NEW_PASSWORD_WAS_SET]);
        }),
        take(1)
      )
      .subscribe();
  }
}
