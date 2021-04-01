import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'mprove-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private userStore: UserStore
  ) {}

  onRegister() {
    // console.log(this.registerForm.value);

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
        map((resp: apiToBackend.ToBackendRegisterUserResponse) => {
          let user = resp.payload.user;

          this.userStore.update(user);

          this.router.navigate([constants.PATH_VERIFY_EMAIL]);
        })
      )
      .subscribe();
  }
}
