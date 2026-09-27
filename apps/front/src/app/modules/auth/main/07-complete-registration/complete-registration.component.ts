import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { COMPLETE_REGISTRATION_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_LOGIN_SUCCESS } from '#common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_TOKEN
} from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendCompleteUserRegistrationInput } from '#common/zod/backend/routes/users/complete-user-registration/complete-user-registration-request';
import type { ToBackendCompleteUserRegistrationResponse } from '#common/zod/backend/routes/users/complete-user-registration/complete-user-registration-response';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { AuthService } from '#front/app/services/auth.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-complete-registration',
  templateUrl: './complete-registration.component.html'
})
export class CompleteRegistrationComponent implements OnInit {
  pageTitle = COMPLETE_REGISTRATION_PAGE_TITLE;

  emailVerificationToken: string;
  bToken: string;
  email: string;

  setPasswordForm: FormGroup = this.fb.group({
    newPassword: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(255)]
    ]
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private title: Title,
    private userQuery: UserQuery,
    private myDialogService: MyDialogService
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.authService.clearLocalStorage();

    this.emailVerificationToken =
      this.route.snapshot.queryParamMap.get('token');
    this.bToken = this.route.snapshot.queryParamMap.get('b');
    if (isDefined(this.bToken)) {
      this.email = atob(this.bToken);
    }
  }

  setPassword() {
    this.setPasswordForm.markAllAsTouched();

    if (!this.setPasswordForm.valid) {
      return;
    }

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendCompleteUserRegistrationInput = {
      emailVerificationToken: this.emailVerificationToken,
      newPassword: this.setPasswordForm.value.newPassword
    };

    this.apiService
      .req({
        route: 'api/ToBackendCompleteUserRegistration',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCompleteUserRegistrationResponse) => {
          if (resp.result?.type === 'Success') {
            let user = resp.result.value.user;
            let token = resp.result.value.token;

            if (isDefined(user) && isDefined(token)) {
              // first email verification
              this.myDialogService.showEmailConfirmed();
              this.userQuery.update(user);
              localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
              this.router.navigate([PATH_LOGIN_SUCCESS]);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
