import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { ProjectStore } from '~front/app/stores/project.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface EditProjectNameDialogDataItem {
  apiService: ApiService;
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'm-edit-project-name-dialog',
  templateUrl: './edit-project-name-dialog.component.html'
})
export class EditProjectNameDialogComponent implements OnInit {
  editProjectNameForm: FormGroup;

  projectId: string;

  constructor(
    public ref: DialogRef<EditProjectNameDialogDataItem>,
    private fb: FormBuilder,
    private projectStore: ProjectStore,
    private navStore: NavStore
  ) {}

  ngOnInit() {
    this.editProjectNameForm = this.fb.group({
      projectName: [this.ref.data.projectName, [Validators.maxLength(255)]]
    });
  }

  save() {
    this.editProjectNameForm.markAllAsTouched();

    if (!this.editProjectNameForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendSetProjectInfoRequestPayload = {
      projectId: this.ref.data.projectId,
      name: this.editProjectNameForm.value.projectName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendSetProjectInfoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let project = resp.payload.project;
            this.projectStore.update(project);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                projectId: project.projectId,
                projectName: project.name
              })
            );
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
