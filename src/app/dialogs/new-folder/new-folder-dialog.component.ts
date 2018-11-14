import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-new-folder-dialog',
  templateUrl: 'new-folder-dialog.component.html'
})
export class NewFolderDialogComponent implements OnInit {
  newFolderForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NewFolderDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { node_id: string },
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.newFolderForm = this.fb.group({
      name: [
        null,
        Validators.compose([Validators.required, Validators.maxLength(20)])
      ]
    });
  }

  onSubmit(fv: any) {
    let repo: api.Repo;
    this.store
      .select(selectors.getSelectedProjectModeRepo)
      .pipe(take(1))
      .subscribe(x => (repo = x));

    this.store.dispatch(
      new actions.CreateFolderAction({
        project_id: repo.project_id,
        repo_id: repo.repo_id,
        node_id: this.data.node_id,
        name: fv['name']
      })
    );
  }
}
