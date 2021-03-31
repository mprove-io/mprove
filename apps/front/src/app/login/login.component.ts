import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'mprove-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    console.log(this.loginForm.value);

    let payload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendLoginUserResponse) => {
          if (resp.payload.user.isEmailVerified === true) {
            localStorage.setItem('token', resp.payload.token);

            // this.router.navigate(['profile']);
          } else {
            // this.store.dispatch(
            //   new actions.UpdateLayoutEmailToVerifyAction(action.payload.user_id)
            // );
            // this.router.navigate(['verify-email-sent']);
          }
        })
      )
      .subscribe();
  }
}
