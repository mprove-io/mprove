import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import { tap } from 'rxjs/operators';
import { ProjectConnectionEnum } from '@app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-update-connection',
  templateUrl: 'update-connection.component.html'
})
export class UpdateConnectionComponent implements OnInit {
  projectConnection: ProjectConnectionEnum;
  projectConnection$ = this.store
    .select(selectors.getSelectedProjectConnection)
    .pipe(
      tap(x => {
        this.projectConnection = x;
        this.updateProjectConnectionForm.patchValue({
          projectConnection: this.projectConnection
        });
        this.checkForm();
      })
    );

  selectedProjectServerTs: number;
  selectedProjectServerTs$ = this.store
    .select(selectors.getSelectedProjectServerTs)
    .pipe(
      tap(x => {
        this.selectedProjectServerTs = x;
      })
    );

  selectedProjectId: string;
  selectedProjectId$ = this.store.select(selectors.getSelectedProjectId).pipe(
    tap(x => {
      this.selectedProjectId = x;
    })
  );
  updateProjectConnectionForm: FormGroup = null;

  selectedProjectUserIsAdmin$ = this.store.select(
    selectors.getSelectedProjectUserIsAdmin
  );

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  connectionEnumKeys(): string[] {
    return Object.keys(api.ProjectConnectionEnum).filter(
      item => !/^[A-Z].*$/.test(item)
    );
  }

  ngOnInit(): void {
    this.buildForm();
    this.checkForm();
  }

  buildForm() {
    this.updateProjectConnectionForm = this.fb.group({
      projectConnection: [
        this.projectConnection,
        Validators.compose([Validators.required])
      ]
    });
  }

  checkForm() {
    if (
      this.updateProjectConnectionForm.get('projectConnection').value ===
      this.projectConnection
    ) {
      this.updateProjectConnectionForm.markAsPristine();
    }
  }

  onSubmit(form: FormGroup, fv: any) {
    if (
      this.updateProjectConnectionForm.get('projectConnection').value !==
      this.projectConnection
    ) {
      this.store.dispatch(
        new actions.SetProjectConnectionAction({
          project_id: this.selectedProjectId,
          server_ts: this.selectedProjectServerTs,
          connection: fv['projectConnection']
        })
      );
    } else {
      this.updateProjectConnectionForm.markAsPristine();
    }
  }

  onReset(form: FormGroup) {
    form.patchValue({
      projectConnection: this.projectConnection
    });
    form.markAsPristine();
  }
}
