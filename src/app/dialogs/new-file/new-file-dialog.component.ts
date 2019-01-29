import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import { ValidationService } from '@app/services/validation.service';

@Component({
  moduleId: module.id,
  selector: 'm-new-file-dialog',
  templateUrl: 'new-file-dialog.component.html'
})
export class NewFileDialogComponent implements OnInit {
  newFileForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NewFileDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { node_id: string },
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.newFileForm = this.fb.group({
      name: [
        null,
        Validators.compose([
          Validators.required,
          ValidationService.doesNotContainThreeUnderscores,
          Validators.maxLength(255)
        ])
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
      new actions.CreateFileAction({
        project_id: repo.project_id,
        repo_id: repo.repo_id,
        node_id: this.data.node_id,
        name: fv['name']
      })
    );

    this.dialogRef.close();
  }
}
