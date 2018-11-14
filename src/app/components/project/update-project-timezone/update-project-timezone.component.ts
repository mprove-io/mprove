import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-update-project-timezone',
  templateUrl: 'update-project-timezone.component.html'
})
export class UpdateProjectTimezoneComponent implements OnChanges {
  @Input()
  selectedProject: api.Project;
  timeZones = api.timezones;
  updateProjectTimezoneForm: FormGroup = null;

  selectedProjectUserIsAdmin$ = this.store.select(
    selectors.getSelectedProjectUserIsAdmin
  );

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnChanges() {
    if (!this.updateProjectTimezoneForm) {
      this.buildForm();
    } else if (
      this.updateProjectTimezoneForm.get('projectTimezone').value ===
      this.selectedProject.timezone
    ) {
      this.updateProjectTimezoneForm.markAsPristine();
    }
  }

  buildForm() {
    this.updateProjectTimezoneForm = this.fb.group({
      projectTimezone: [
        this.selectedProject.timezone,
        Validators.compose([Validators.required])
      ]
    });
  }

  onSubmit(form: FormGroup, fv: any) {
    this.store.dispatch(
      new actions.SetProjectTimezoneAction({
        project_id: this.selectedProject.project_id,
        server_ts: this.selectedProject.server_ts,
        timezone: fv['projectTimezone']
      })
    );
  }

  onReset(form: FormGroup) {
    form.patchValue({
      projectTimezone: this.selectedProject.timezone
    });
    form.markAsPristine();
  }
}
