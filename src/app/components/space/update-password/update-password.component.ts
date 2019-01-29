import { Component, OnInit } from '@angular/core';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';
import * as actions from '@app/store/actions/_index';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: 'm-update-password',
  templateUrl: 'update-password.component.html'
})
export class UpdatePasswordComponent implements OnInit {
  token;
  updatePasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public pageTitle: services.PageTitleService,
    private store: Store<interfaces.AppState>,
    private route: ActivatedRoute,
    private watchAuthenticationService: services.WatchAuthenticationService
  ) {
    this.pageTitle.setTitle('Set New Password | Mprove');
  }

  ngOnInit() {
    // auth token
    localStorage.removeItem('token');

    // change password token
    this.token = this.route.snapshot.queryParamMap.get('token');

    this.buildForm();
  }

  buildForm(): void {
    this.updatePasswordForm = this.fb.group(
      {
        password: [
          null,
          Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(255)
          ])
        ],
        confirmPassword: [null, Validators.compose([Validators.required])]
      },
      {
        validator: services.ValidationService.passwordMatchValidator
      }
    );
  }

  onSubmit(fv: any) {
    this.store.dispatch(
      new actions.UpdateUserPasswordAction({
        token: this.token,
        password: fv['password']
      })
    );
    this.store.dispatch(new actions.LogoutUserAction({ empty: true }));
  }
}
