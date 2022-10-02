import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavStore } from '~front/app/stores/nav.store';
import { ProjectStore } from '~front/app/stores/project.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteProjectDialogDataItem {
  apiService: ApiService;
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'm-delete-project-dialog',
  templateUrl: './delete-project-dialog.component.html'
})
export class DeleteProjectDialogComponent {
  constructor(
    public ref: DialogRef<DeleteProjectDialogDataItem>,
    private router: Router,
    private projectStore: ProjectStore,
    private navStore: NavStore
  ) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteProjectRequestPayload = {
      projectId: this.ref.data.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteProject,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            localStorage.setItem(
              constants.LOCAL_STORAGE_DELETED_PROJECT_NAME,
              this.ref.data.projectName
            );
            this.router.navigate([common.PATH_PROJECT_DELETED]);
            this.navStore.clearProjectAndDeps();
            this.projectStore.reset();
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
