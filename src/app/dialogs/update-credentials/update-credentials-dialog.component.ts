import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  moduleId: module.id,
  selector: 'm-update-credentials-dialog',
  templateUrl: 'update-credentials-dialog.component.html'
})
export class UpdateCredentialsDialogComponent implements OnInit, OnDestroy {

  selectedProject: api.Project;
  selectedProjectSub: Subscription;

  updateCredentialsForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateCredentialsDialogComponent>,
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>) {
  }

  ngOnInit(): void {
    this.selectedProjectSub = this.store.select(selectors.getSelectedProject)
      .pipe(filter(v => !!v))
      .subscribe(x => this.selectedProject = x);

    this.buildForm();
  }

  ngOnDestroy() {
    this.selectedProjectSub.unsubscribe();
  }

  buildForm(): void {
    this.updateCredentialsForm = this.fb.group({
      'credentials': [
        null,
        Validators.compose([
          Validators.required,
          ValidationService.checkTextSize
        ])
      ],
    });

  }

  onSubmit(fv: any) {
    this.store.dispatch(new actions.SetProjectCredentialsAction({
      project_id: this.selectedProject.project_id,
      server_ts: this.selectedProject.server_ts,
      // credentials: 'abcd',
      credentials: fv['credentials'],
    }));
  }
}
