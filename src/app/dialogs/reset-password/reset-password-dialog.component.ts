import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import * as actions from '@app/store-actions/_index';
import * as interfaces from '@app/interfaces/_index';
import * as configs from '@app/configs/_index';

@Component({
  moduleId: module.id,
  selector: 'm-reset-password-dialog',
  templateUrl: 'reset-password-dialog.component.html'
})
export class ResetPasswordDialogComponent implements OnInit {
  resetPasswordForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.resetPasswordForm = this.fb.group({
      email: [
        null,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  onSubmit(fv: any) {
    this.store.dispatch(
      new actions.ResetUserPasswordAction({
        user_id: fv['email'],
        url: configs.pathConfig.devEmailLinkBaseUrl
      })
    );
  }
}
