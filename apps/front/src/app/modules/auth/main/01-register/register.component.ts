import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, take, tap } from 'rxjs/operators';
import { SIGN_UP_PAGE_TITLE } from '~common/constants/page-titles';
import {
  PATH_LOGIN,
  PATH_REGISTER,
  PATH_VERIFY_EMAIL
} from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToBackendCheckSignUpResponse } from '~common/interfaces/to-backend/check/to-backend-check-sign-up';
import {
  ToBackendRegisterUserRequestPayload,
  ToBackendRegisterUserResponse
} from '~common/interfaces/to-backend/users/to-backend-register-user';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';

@Component({
  standalone: false,
  selector: 'm-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  pageTitle = SIGN_UP_PAGE_TITLE;

  registerForm: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(255)]
    ],
    password: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(255)]
    ]
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
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCheckSignUp,
        payload: {}
      })
      .pipe(
        tap((resp: ToBackendCheckSignUpResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.isRegisterOnlyInvitedUsers =
              resp.payload.isRegisterOnlyInvitedUsers;

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

    let payload: ToBackendRegisterUserRequestPayload = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendRegisterUserResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;

            this.userQuery.update(user);

            this.router.navigate([PATH_VERIFY_EMAIL]);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
