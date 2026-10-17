import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import { LOG_IN_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_FORGOT_PASSWORD,
  PATH_LOGIN,
  PATH_LOGIN_SUCCESS,
  PATH_REGISTER,
  PATH_VERIFY_EMAIL,
  RESTRICTED_USER_EMAIL
} from '#common/constants/top';
import { LOCAL_STORAGE_TOKEN } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendLoginUserOutput } from '#common/types/backend/routes/users/login-user/login-user-output';
import type { ToBackendLoginUserRequest } from '#common/types/backend/routes/users/login-user/login-user-request';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';
import { AuthService } from '#front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  pageTitle = LOG_IN_PAGE_TITLE;

  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    email: this.fb.control<string>('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(255)
    ]),
    password: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(255)
    ])
  });

  currentRoute: string;

  pathRegister = PATH_REGISTER;
  pathLogin = PATH_LOGIN;
  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[1];
    })
  );

  constructor(
    private appSpinnerService: AppSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private userQuery: UserQuery,
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];

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

  navSignUp() {
    this.router.navigate([PATH_REGISTER]);
  }

  navLogin() {
    this.router.navigate([PATH_LOGIN]);
  }

  login() {
    this.loginForm.markAllAsTouched();

    if (!this.loginForm.valid) {
      return;
    }

    let payload: ToBackendLoginUserRequest['input'] = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.apiService
      .req({
        route: 'api/ToBackendLoginUser',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendLoginUserOutput = resp.output;

          let user = output.user;
          let token = output.token;

          this.userQuery.update(user);

          if (user.isEmailVerified === true) {
            localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
            this.router.navigate([PATH_LOGIN_SUCCESS]);
          } else {
            this.router.navigate([PATH_VERIFY_EMAIL]);
          }
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  forgotPassword() {
    this.router.navigate([PATH_FORGOT_PASSWORD]);
  }
}
