import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { COMPLETE_REGISTRATION_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_LOGIN_SUCCESS } from '#common/constants/top';
import { LOCAL_STORAGE_TOKEN } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendCompleteUserRegistrationOutput } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-output';
import type { ToBackendCompleteUserRegistrationRequest } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-request';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';
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

  setPasswordForm: FormGroup<{
    newPassword: FormControl<string>;
  }> = this.fb.group({
    newPassword: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(255)
    ])
  });

  constructor(
    private appSpinnerService: AppSpinnerService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
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

    let payload: ToBackendCompleteUserRegistrationRequest['input'] = {
      emailVerificationToken: this.emailVerificationToken,
      newPassword: this.setPasswordForm.value.newPassword
    };

    this.apiService
      .req({
        route: 'api/ToBackendCompleteUserRegistration',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendCompleteUserRegistrationOutput = resp.output;

          let user = output.user;
          let token = output.token;

          if (isDefined(user) && isDefined(token)) {
            // first email verification
            this.myDialogService.showEmailConfirmed();
            this.userQuery.update(user);
            localStorage.setItem(LOCAL_STORAGE_TOKEN, token);
            this.router.navigate([PATH_LOGIN_SUCCESS]);
          }
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }
}
