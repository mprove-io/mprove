import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'src/app/store/actions/_index';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-update-week-start',
  templateUrl: 'update-week-start.component.html',
})

export class UpdateWeekStartComponent implements OnChanges {
  @Input()
  selectedProject: api.Project;
  updateWeekStartForm: FormGroup = null;

  selectedProjectUserIsAdmin$ = this.store.select(selectors.getSelectedProjectUserIsAdmin);

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>) {
  }

  weekStartEnumKeys(): string[] {
    return Object.keys(api.ProjectWeekStartEnum).filter(item => !/^[A-Z].*$/.test(item));
  }

  ngOnChanges() {
    if (!this.updateWeekStartForm) {
      this.buildForm();

    } else if (this.updateWeekStartForm.get('weekStart').value === this.selectedProject.week_start) {
      this.updateWeekStartForm.markAsPristine();
    }
  }

  buildForm() {
    this.updateWeekStartForm = this.fb.group({
      'weekStart': [
        this.selectedProject.week_start,
        Validators.compose([
          Validators.required,
        ])
      ],
    });
  }

  onSubmit(form: FormGroup, fv: any) {
    this.store.dispatch(new actions.SetProjectWeekStartAction({
      project_id: this.selectedProject.project_id,
      server_ts: this.selectedProject.server_ts,
      week_start: fv['weekStart'],
    }));
  }

  onReset(form: FormGroup) {
    form.patchValue({
      weekStart: this.selectedProject.week_start
    });
    form.markAsPristine();
  }
}
