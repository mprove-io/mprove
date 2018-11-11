import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-update-query-size-limit',
  templateUrl: 'update-query-size-limit.component.html',
})
export class UpdateQuerySizeLimitComponent implements OnChanges {
  @Input()
  selectedProject: api.Project;
  updateQuerySizeLimitForm: FormGroup = null;

  selectedProjectUserIsAdmin$ = this.store.select(selectors.getSelectedProjectUserIsAdmin);

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>) {
  }

  ngOnChanges(): void {
    if (!this.updateQuerySizeLimitForm) {
      this.buildForm();

    } else if (this.updateQuerySizeLimitForm.get('querySizeLimit').value === this.selectedProject.query_size_limit) {
      this.updateQuerySizeLimitForm.markAsPristine();
    }
  }

  buildForm(): void {
    this.updateQuerySizeLimitForm = this.fb.group({
      'querySizeLimit': [
        this.selectedProject.query_size_limit,
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(255)
        ])
      ],
    });
  }

  onSubmit(form: FormGroup, fv: any) {
    this.store.dispatch(new actions.SetProjectQuerySizeLimitAction({
      project_id: this.selectedProject.project_id,
      server_ts: this.selectedProject.server_ts,
      query_size_limit: fv['querySizeLimit'],
    }));
  }

  onReset(form: FormGroup) {
    form.patchValue({
      querySizeLimit: this.selectedProject.query_size_limit
    });
    form.markAsPristine();
  }
}
