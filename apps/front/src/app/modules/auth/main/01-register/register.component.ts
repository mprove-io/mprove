import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { SIGN_UP_PAGE_TITLE } from '~common/constants/page-titles';
import { PATH_VERIFY_EMAIL } from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
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

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private userQuery: UserQuery,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
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
