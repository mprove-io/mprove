import { Component, Input, OnChanges, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from '@app/store-actions/_index';
import * as selectors from '@app/store/selectors/_index';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import { tap } from 'rxjs/operators';

@Component({
  moduleId: module.id,
  selector: 'm-edit-name',
  templateUrl: 'edit-name.component.html'
})
export class EditNameComponent implements OnInit {
  userFirstName: string;
  userFirstName$ = this.store.select(selectors.getUserFirstName).pipe(
    tap(x => {
      this.userFirstName = x;
      this.nameForm.patchValue({ firstName: this.userFirstName });
      this.checkForm();
    })
  );

  userLastName: string;
  userLastName$ = this.store.select(selectors.getUserLastName).pipe(
    tap(x => {
      this.userLastName = x;
      this.nameForm.patchValue({ lastName: this.userLastName });
      this.checkForm();
    })
  );

  userServerTs: number;
  userServerTs$ = this.store.select(selectors.getUserServerTs).pipe(
    tap(x => {
      this.userServerTs = x;
    })
  );

  nameForm: FormGroup = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.checkForm();
  }

  buildForm(): void {
    this.nameForm = this.fb.group({
      firstName: [
        this.userFirstName,
        Validators.compose([Validators.required, Validators.maxLength(20)])
      ],
      lastName: [
        this.userLastName,
        Validators.compose([Validators.required, Validators.maxLength(20)])
      ]
    });
  }

  checkForm() {
    if (
      this.nameForm.get('firstName').value === this.userFirstName &&
      this.nameForm.get('lastName').value === this.userLastName
    ) {
      this.nameForm.markAsPristine();
    }
  }

  onSubmit(form: FormGroup, fv: any) {
    if (
      this.nameForm.get('firstName').value !== this.userFirstName ||
      this.nameForm.get('lastName').value !== this.userLastName
    ) {
      this.store.dispatch(
        new actions.SetUserNameAction({
          first_name: fv['firstName'],
          last_name: fv['lastName'],
          server_ts: this.userServerTs
        })
      );
    } else {
      this.nameForm.markAsPristine();
    }
  }

  onReset(form: FormGroup) {
    form.patchValue({
      firstName: this.userFirstName,
      lastName: this.userLastName
    });
    form.markAsPristine();
  }
}
