import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
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
    private router: Router,
    private userStore: UserStore,
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

    let payload: apiToBackend.ToBackendRegisterUserRequestPayload = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendRegisterUserResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;

            this.userStore.update(user);

            this.router.navigate([common.PATH_VERIFY_EMAIL]);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
