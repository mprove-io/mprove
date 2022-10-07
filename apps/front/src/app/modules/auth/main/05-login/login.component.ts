import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  pageTitle = constants.LOG_IN_PAGE_TITLE;

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
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private userStore: UserStore,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.userStore.reset();
    // console.log('startWatch from LoginComponent');
    this.authService.startWatch();

    let email = this.route.snapshot.queryParamMap.get('email');
    let password = this.route.snapshot.queryParamMap.get('password');

    if (common.isDefined(email) && common.isDefined(password)) {
      this.loginForm.controls['email'].setValue(email);
      this.loginForm.controls['password'].setValue(password);
    }
  }

  login() {
    this.loginForm.markAllAsTouched();

    if (!this.loginForm.valid) {
      return;
    }

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendLoginUserResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            let token = resp.payload.token;

            this.userStore.update(user);

            if (user.isEmailVerified === true) {
              // console.log('stopWatch from LoginComponent');
              this.authService.stopWatch();
              localStorage.setItem(constants.LOCAL_STORAGE_TOKEN, token);
              this.router.navigate([common.PATH_LOGIN_SUCCESS]);
            } else {
              this.router.navigate([common.PATH_VERIFY_EMAIL]);
            }
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
