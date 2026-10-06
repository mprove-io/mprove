import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, take, tap } from 'rxjs/operators';
import { SIGN_UP_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_LOGIN,
  PATH_REGISTER,
  PATH_VERIFY_EMAIL
} from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import type { ToBackendCheckSignUpResponse } from '#common/types/backend/routes/check/check-sign-up/check-sign-up-response';
import type { ToBackendRegisterUserRequest } from '#common/types/backend/routes/users/register-user/register-user-request';
import type { ToBackendRegisterUserResponse } from '#common/types/backend/routes/users/register-user/register-user-response';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';

@Component({
  standalone: false,
  selector: 'm-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  pageTitle = SIGN_UP_PAGE_TITLE;

  registerForm: FormGroup<{
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

  isRegisterOnlyInvitedUsers = false;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[1];
    })
  );

  registerCheckSpinnerName = 'registerCheckSpinnerName';
  checkLoaded = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private userQuery: UserQuery,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];

    this.title.setTitle(this.pageTitle);

    this.spinner.show(this.registerCheckSpinnerName);

    this.apiService
      .req({
        route: 'api/ToBackendCheckSignUp',
        payload: {}
      })
      .pipe(
        tap((resp: ToBackendCheckSignUpResponse) => {
          if (resp.type === 'Success') {
            this.isRegisterOnlyInvitedUsers =
              resp.output.isRegisterOnlyInvitedUsers;

            this.checkLoaded = true;
            this.cd.detectChanges();
          }

          this.spinner.hide(this.registerCheckSpinnerName);
        }),
        take(1)
      )
      .subscribe();
  }

  navSignUp() {
    this.router.navigate([PATH_REGISTER]);
  }

  navLogin() {
    this.router.navigate([PATH_LOGIN]);
  }

  register() {
    this.registerForm.markAllAsTouched();

    if (!this.registerForm.valid) {
      return;
    }

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendRegisterUserRequest['input'] = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.apiService
      .req({
        route: 'api/ToBackendRegisterUser',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendRegisterUserResponse) => {
          if (resp.type === 'Success') {
            let user = resp.output.user;

            this.userQuery.update(user);

            this.router.navigate([PATH_VERIFY_EMAIL]);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
