import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-update-remote-url-dialog',
  templateUrl: 'update-remote-url-dialog.component.html'
})
export class UpdateRemoteUrlDialogComponent implements OnInit, OnDestroy {
  selectedProject: api.Project;
  selectedProjectSub: Subscription;

  updateUrlForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateRemoteUrlDialogComponent>,
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
    this.updateUrlForm = this.fb.group({
      url: [
        null,
        Validators.compose([
          // do not add required
          Validators.maxLength(255)
        ])
      ]
    });
  }

  onSubmit(fv: any) {
    let devRepo: api.Repo;
    this.store
      .select(selectors.getSelectedProjectDevRepo)
      .pipe(take(1))
      .subscribe(x => (devRepo = x));

    this.store.dispatch(
      new actions.SetRepoRemoteUrlAction({
        project_id: devRepo.project_id,
        repo_id: devRepo.repo_id,
        server_ts: devRepo.server_ts,
        remote_url: fv['url']
      })
    );
  }
}
