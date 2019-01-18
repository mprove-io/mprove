import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import { tap } from 'rxjs/operators';

@Component({
  moduleId: module.id,
  selector: 'm-update-user-timezone',
  templateUrl: 'update-user-timezone.component.html'
})
export class UpdateUserTimezoneComponent implements OnInit {
  userTimezone: string;
  userTimezone$ = this.store.select(selectors.getUserTimezone).pipe(
    tap(x => {
      this.userTimezone = x;
      this.updateUserTimezoneForm.patchValue({
        userTimezone: this.userTimezone
      });
      this.checkForm();
    })
  );

  userServerTs: number;
  userServerTs$ = this.store.select(selectors.getUserServerTs).pipe(
    tap(x => {
      this.userServerTs = x;
    })
  );

  timeZones = api.timezones;
  updateUserTimezoneForm: FormGroup = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.checkForm();
  }

  buildForm() {
    this.updateUserTimezoneForm = this.fb.group({
      userTimezone: [
        this.userTimezone,
        Validators.compose([Validators.required])
      ]
    });
  }

  checkForm() {
    if (
      this.updateUserTimezoneForm.get('userTimezone').value ===
      this.userTimezone
    ) {
      this.updateUserTimezoneForm.markAsPristine();
    }
  }

  onSubmit(form: FormGroup, fv: any) {
    if (
      this.updateUserTimezoneForm.get('userTimezone').value !==
      this.userTimezone
    ) {
      this.store.dispatch(
        new actions.SetUserTimezoneAction({
          server_ts: this.userServerTs,
          timezone: fv['userTimezone']
        })
      );
    } else {
      this.updateUserTimezoneForm.markAsPristine();
    }
  }

  onReset(form: FormGroup) {
    form.patchValue({
      userTimezone: this.userTimezone
    });
    form.markAsPristine();
  }
}
