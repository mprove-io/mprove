import { Component, HostListener, OnInit } from '@angular/core';
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

export interface DeleteFileDialogData {
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
export class DeleteFileDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteFileDialogData>,
    private repoStore: RepoStore,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,

    private navStore: NavStore,
    public structStore: StructStore
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

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
        payload: payload,
        showSpinner: true
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
