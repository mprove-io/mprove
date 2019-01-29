import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import * as actions from '@app/store/actions/_index';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';

@Component({
  moduleId: module.id,
  selector: 'm-delete-file-dialog',
  templateUrl: 'delete-file-dialog.component.html'
})
export class DeleteFileDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: api.CatalogFile },
    private store: Store<interfaces.AppState>
  ) {}

  onSubmit() {
    this.store.dispatch(
      new actions.DeleteFileAction({
        project_id: this.data.file.project_id,
        repo_id: this.data.file.repo_id,
        file_id: this.data.file.file_id,
        server_ts: this.data.file.server_ts
      })
    );
  }
}
