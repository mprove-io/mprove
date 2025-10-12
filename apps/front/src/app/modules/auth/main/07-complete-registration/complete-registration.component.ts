import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { COMPLETE_REGISTRATION_PAGE_TITLE } from '~common/constants/page-titles';
import { PATH_LOGIN_SUCCESS } from '~common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_TOKEN
} from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendCompleteUserRegistrationRequestPayload,
  ToBackendCompleteUserRegistrationResponse
} from '~common/interfaces/to-backend/users/to-backend-complete-user-registration';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

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
    // this.authService.stopWatch();

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

    let payload: ToBackendCompleteUserRegistrationRequestPayload = {
      emailVerificationToken: this.emailVerificationToken,
      newPassword: this.setPasswordForm.value.newPassword
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCompleteUserRegistrationResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            let token = resp.payload.token;

            if (isDefined(user) && isDefined(token)) {
              // first email verification
              this.myDialogService.showEmailConfirmed();
              this.userQuery.update(user);
              // console.log('stopWatch from CompleteRegistrationComponent - 2');
              // this.authService.stopWatch();
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
