import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';

@Component({
  moduleId: module.id,
  selector: 'm-update-user-timezone',
  templateUrl: 'update-user-timezone.component.html'
})
export class UpdateUserTimezoneComponent implements OnChanges {
  @Input()
  user: api.User;
  timeZones = api.timezones;
  updateUserTimezoneForm: FormGroup = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnChanges() {
    if (!this.updateUserTimezoneForm) {
      this.buildForm();
    } else if (
      this.updateUserTimezoneForm.get('userTimezone').value ===
      this.user.timezone
    ) {
      this.updateUserTimezoneForm.markAsPristine();
    }
  }

  buildForm() {
    this.updateUserTimezoneForm = this.fb.group({
      userTimezone: [
        this.user.timezone,
        Validators.compose([Validators.required])
      ]
    });
  }

  onSubmit(form: FormGroup, fv: any) {
    this.store.dispatch(
      new actions.SetUserTimezoneAction({
        server_ts: this.user.server_ts,
        timezone: fv['userTimezone']
      })
    );
  }

  onReset(form: FormGroup) {
    form.patchValue({
      userTimezone: this.user.timezone
    });
    form.markAsPristine();
  }
}
