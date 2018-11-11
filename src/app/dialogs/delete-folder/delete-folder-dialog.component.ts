import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-delete-folder-dialog',
  templateUrl: 'delete-folder-dialog.component.html'
})
export class DeleteFolderDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteFolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { node_id: string },
    private store: Store<interfaces.AppState>) {
  }

  onSubmit() {

    let repo: api.Repo;
    this.store.select(selectors.getSelectedProjectModeRepo)
      .pipe(take(1))
      .subscribe(x => repo = x);

    this.store.dispatch(new actions.DeleteFolderAction(
      {
        project_id: repo.project_id,
        repo_id: repo.repo_id,
        repo_server_ts: repo.server_ts,
        node_id: this.data.node_id,
      })
    );
  }
}
