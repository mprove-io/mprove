import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from '@app/store/actions/_index';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import { tap } from 'rxjs/operators';

@Component({
  moduleId: module.id,
  selector: 'm-update-project-timezone',
  templateUrl: 'update-project-timezone.component.html'
})
export class UpdateProjectTimezoneComponent implements OnInit {
  projectTimezone: string;
  projectTimezone$ = this.store
    .select(selectors.getSelectedProjectTimezone)
    .pipe(
      tap(x => {
        this.projectTimezone = x;
        this.updateProjectTimezoneForm.patchValue({
          projectTimezone: this.projectTimezone
        });
        this.checkForm();
      })
    );

  selectedProjectServerTs: number;
  selectedProjectServerTs$ = this.store
    .select(selectors.getSelectedProjectServerTs)
    .pipe(
      tap(x => {
        this.selectedProjectServerTs = x;
      })
    );

  selectedProjectId: string;
  selectedProjectId$ = this.store.select(selectors.getSelectedProjectId).pipe(
    tap(x => {
      this.selectedProjectId = x;
    })
  );

  timeZones = api.timezones;
  updateProjectTimezoneForm: FormGroup = null;

  selectedProjectUserIsAdmin$ = this.store.select(
    selectors.getSelectedProjectUserIsAdmin
  );

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.checkForm();
  }

  buildForm() {
    this.updateProjectTimezoneForm = this.fb.group({
      projectTimezone: [
        this.projectTimezone,
        Validators.compose([Validators.required])
      ]
    });
  }

  checkForm() {
    if (
      this.updateProjectTimezoneForm.get('projectTimezone').value ===
      this.projectTimezone
    ) {
      this.updateProjectTimezoneForm.markAsPristine();
    }
  }

  onSubmit(form: FormGroup, fv: any) {
    if (
      this.updateProjectTimezoneForm.get('projectTimezone').value !==
      this.projectTimezone
    ) {
      this.store.dispatch(
        new actions.SetProjectTimezoneAction({
          project_id: this.selectedProjectId,
          server_ts: this.selectedProjectServerTs,
          timezone: fv['projectTimezone']
        })
      );
    } else {
      this.updateProjectTimezoneForm.markAsPristine();
    }
  }

  onReset(form: FormGroup) {
    form.patchValue({
      projectTimezone: this.projectTimezone
    });
    form.markAsPristine();
  }
}
