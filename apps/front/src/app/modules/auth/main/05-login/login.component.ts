import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(255)]
    ],
    password: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(255)]
    ]
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private userStore: UserStore,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userStore.reset();
    this.authService.startWatch();
  }

  login() {
    this.loginForm.markAllAsTouched();

    if (!this.loginForm.valid) {
      return;
    }

    let payload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendLoginUserResponse) => {
          let user = resp.payload.user;
          let token = resp.payload.token;

          this.userStore.update(user);

          if (user.isEmailVerified === true) {
            this.authService.stopWatch();
            localStorage.setItem('token', token);
            this.router.navigate([common.PATH_PROFILE]);
          } else {
            this.router.navigate([common.PATH_VERIFY_EMAIL]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  forgotPassword() {
    this.router.navigate([common.PATH_FORGOT_PASSWORD]);
  }
}
