import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  standalone: false,
  selector: 'm-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  pageTitle = constants.SIGN_UP_PAGE_TITLE;

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

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendRegisterUserRequestPayload = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendRegisterUserResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;

            this.userQuery.update(user);

            this.router.navigate([common.PATH_VERIFY_EMAIL]);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
