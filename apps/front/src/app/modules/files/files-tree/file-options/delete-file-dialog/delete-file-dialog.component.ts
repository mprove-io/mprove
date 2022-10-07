import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteFileDialogDataItem {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  fileNodeId: string;
  fileName: string;
}

@Component({
  selector: 'm-delete-file-dialog',
  templateUrl: './delete-file-dialog.component.html'
})
export class DeleteFileDialogComponent {
  constructor(
    public ref: DialogRef<DeleteFileDialogDataItem>,
    private repoStore: RepoStore,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,

    private navStore: NavStore,
    public structStore: StructStore
  ) {}

  delete() {
    this.ref.close();

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendDeleteFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      fileNodeId: this.ref.data.fileNodeId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFile,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteFileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            this.navigateService.navigateToFiles();
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
