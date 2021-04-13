import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-update-password',
  templateUrl: './update-password.component.html'
})
export class UpdatePasswordComponent implements OnInit {
  passwordResetToken: string;

  setPasswordForm: FormGroup = this.fb.group(
    {
      newPassword: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(255)
        ])
      ],
      confirmPassword: [null, Validators.compose([Validators.required])]
    },
    {
      validator: ValidationService.passwordMatchValidator
    }
  );

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private userStore: UserStore,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.passwordResetToken = this.route.snapshot.queryParamMap.get('token');
  }

  setPassword() {
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
          this.router.navigate([common.PATH_LOGIN]);
        }),
        take(1)
      )
      .subscribe();
  }
}
