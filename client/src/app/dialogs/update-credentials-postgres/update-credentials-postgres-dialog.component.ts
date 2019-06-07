import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import { ValidationService } from '@app/services/validation.service';

@Component({
  moduleId: module.id,
  selector: 'm-update-credentials-postgres-dialog',
  templateUrl: 'update-credentials-postgres-dialog.component.html',
  styleUrls: ['update-credentials-postgres-dialog.component.scss']
})
export class UpdateCredentialsPostgresDialogComponent
  implements OnInit, OnDestroy {
  selectedProject: api.Project;
  selectedProjectSub: Subscription;

  updateCredentialsPostgresForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateCredentialsPostgresDialogComponent>,
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit(): void {
    this.selectedProjectSub = this.store
      .select(selectors.getSelectedProject)
      .pipe(filter(v => !!v))
      .subscribe(x => (this.selectedProject = x));

    this.buildForm();
  }

  ngOnDestroy() {
    this.selectedProjectSub.unsubscribe();
  }

  buildForm(): void {
    this.updateCredentialsPostgresForm = this.fb.group({
      postgresHost: [
        null,
        Validators.compose([
          Validators.required,
          ValidationService.checkTextSize
        ])
      ],
      postgresPort: [
        null,
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(255)
        ])
      ],
      postgresDatabase: [null, Validators.compose([Validators.required])],
      postgresUser: [null, Validators.compose([Validators.required])],
      postgresPassword: [null, Validators.compose([Validators.required])]
    });
  }

  delete() {
    this.store.dispatch(
      new actions.DeleteProjectCredentialsAction({
        project_id: this.selectedProject.project_id,
        server_ts: this.selectedProject.server_ts
      })
    );
  }

  onSubmit(fv: any) {
    this.store.dispatch(
      new actions.SetProjectCredentialsAction({
        project_id: this.selectedProject.project_id,
        server_ts: this.selectedProject.server_ts,
        postgres_host: fv['postgresHost'],
        postgres_port: fv['postgresPort'],
        postgres_database: fv['postgresDatabase'],
        postgres_user: fv['postgresUser'],
        postgres_password: fv['postgresPassword']
      })
    );
  }
}
