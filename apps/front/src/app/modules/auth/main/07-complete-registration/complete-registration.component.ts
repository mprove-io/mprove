import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-complete-registration',
  templateUrl: './complete-registration.component.html'
})
export class CompleteRegistrationComponent implements OnInit {
  pageTitle = constants.COMPLETE_REGISTRATION_PAGE_TITLE;

  emailConfirmationToken: string;
  bToken: string;
  email: string;

  setPasswordForm: FormGroup = this.fb.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(255)
        ]
      ]
      // ,
      // confirmPassword: ['', [Validators.required]]
    }
    // ,
    // {
    //   validator: ValidationService.passwordMatchValidator
    // }
  );

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
    // console.log('stopWatch from CompleteRegistrationComponent');
    this.authService.stopWatch();

    this.emailConfirmationToken =
      this.route.snapshot.queryParamMap.get('token');
    this.bToken = this.route.snapshot.queryParamMap.get('b');
    if (common.isDefined(this.bToken)) {
      this.email = atob(this.bToken);
    }
  }

  setPassword() {
    this.setPasswordForm.markAllAsTouched();

    if (!this.setPasswordForm.valid) {
      return;
    }

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendCompleteUserRegistrationRequestPayload =
      {
        emailConfirmationToken: this.emailConfirmationToken,
        newPassword: this.setPasswordForm.value.newPassword
      };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCompleteUserRegistration,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCompleteUserRegistrationResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            let token = resp.payload.token;

            if (common.isDefined(user) && common.isDefined(token)) {
              // first email verification
              this.myDialogService.showEmailConfirmed();
              this.userQuery.update(user);
              // console.log('stopWatch from CompleteRegistrationComponent - 2');
              this.authService.stopWatch();
              localStorage.setItem(constants.LOCAL_STORAGE_TOKEN, token);
              this.router.navigate([common.PATH_LOGIN_SUCCESS]);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
