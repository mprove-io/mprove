import { Router } from '@angular/router';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'app/store/actions/_index';
import * as interfaces from 'app/interfaces/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-register',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public pageTitle: services.PageTitleService,
    private store: Store<interfaces.AppState>,
    private watchAuthenticationService: services.WatchAuthenticationService
  ) {
    this.pageTitle.setTitle('Register | Mprove');
  }

  ngOnInit(): void {
    this.watchAuthenticationService.start();

    this.buildForm();
  }

  buildForm(): void {
    this.registerForm = this.fb.group({
      email: [null, Validators.compose([Validators.maxLength(255)])],
      password: [null, Validators.compose([Validators.maxLength(255)])]
    });
  }

  onSubmit(fv: any) {
    this.store.dispatch(
      new actions.RegisterUserAction({
        user_id: fv['email'],
        password: fv['password']
      })
    );
  }
}
