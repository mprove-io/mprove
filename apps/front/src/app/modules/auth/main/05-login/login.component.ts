import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { LOG_IN_PAGE_TITLE } from '~common/constants/page-titles';
import {
  PATH_FORGOT_PASSWORD,
  PATH_LOGIN_SUCCESS,
  PATH_VERIFY_EMAIL,
  RESTRICTED_USER_EMAIL
} from '~common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_TOKEN
} from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendLoginUserRequestPayload,
  ToBackendLoginUserResponse
} from '~common/interfaces/to-backend/users/to-backend-login-user';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  pageTitle = LOG_IN_PAGE_TITLE;

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
    private userQuery: UserQuery,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.userQuery.reset();

    let email = this.route.snapshot.queryParamMap.get('email');
    let password = this.route.snapshot.queryParamMap.get('password');

    if (email === RESTRICTED_USER_EMAIL && isDefined(password)) {
      this.loginForm.controls['email'].setValue(email);
      this.loginForm.controls['password'].setValue(password);
      this.login();
    }
  }

  login() {
    this.loginForm.markAllAsTouched();

    if (!this.loginForm.valid) {
      return;
    }

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendLoginUserRequestPayload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendLoginUserResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            let token = resp.payload.token;

            this.userQuery.update(user);

            if (user.isEmailVerified === true) {
              localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
              this.router.navigate([PATH_LOGIN_SUCCESS]);
            } else {
              this.router.navigate([PATH_VERIFY_EMAIL]);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  forgotPassword() {
    this.router.navigate([PATH_FORGOT_PASSWORD]);
  }
}
