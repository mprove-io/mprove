import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-delete-project-dialog',
  templateUrl: 'delete-project-dialog.component.html'
})
export class DeleteProjectDialogComponent {

  selectedProjectId$ = this.store.select(selectors.getSelectedProjectId)
    .pipe(
      filter(v => !!v)
    );

  constructor(
    public dialogRef: MatDialogRef<DeleteProjectDialogComponent>,
    private store: Store<interfaces.AppState>) {
  }

  onSubmit() {
    let selectedProject: api.Project;
    this.store.select(selectors.getSelectedProject)
      .pipe(take(1))
      .subscribe(x => selectedProject = x);

    this.store.dispatch(new actions.DeleteProjectAction({
      project_id: selectedProject.project_id,
      server_ts: selectedProject.server_ts,
    }));
  }
}
