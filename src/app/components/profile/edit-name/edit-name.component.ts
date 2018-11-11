import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'src/app/store/actions/_index';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';

@Component({
  moduleId: module.id,
  selector: 'm-edit-name',
  templateUrl: 'edit-name.component.html',
})
export class EditNameComponent implements OnChanges {
  @Input()
  user: api.User;
  nameForm: FormGroup = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>) {
  }

  ngOnChanges() {
    if (!this.nameForm) {
      this.buildForm();

    } else if (this.nameForm.get('firstName').value === this.user.first_name &&
      this.nameForm.get('lastName').value === this.user.last_name) {

      this.nameForm.markAsPristine();
    }
  }

  buildForm(): void {
    this.nameForm = this.fb.group({
      'firstName': [
        this.user.first_name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(20)
        ])
      ],
      'lastName': [
        this.user.last_name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(20)
        ])]
    });
  }

  onSubmit(form: FormGroup, fv: any) {
    this.store.dispatch(new actions.SetUserNameAction(
      {
        first_name: fv['firstName'],
        last_name: fv['lastName'],
        server_ts: this.user.server_ts,
      })
    );
  }

  onReset(form: FormGroup) {
    form.patchValue({
      firstName: this.user.first_name,
      lastName: this.user.last_name
    });
    form.markAsPristine();
  }
}
