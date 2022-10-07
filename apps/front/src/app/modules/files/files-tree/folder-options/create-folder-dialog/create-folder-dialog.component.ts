import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface CreateFolderDialogDataItem {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
}

@Component({
  selector: 'm-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html'
})
export class CreateFolderDialogComponent implements OnInit {
  createFolderForm: FormGroup;

  constructor(
    public ref: DialogRef<CreateFolderDialogDataItem>,
    private fb: FormBuilder,
    public structStore: StructStore,
    private repoStore: RepoStore,
    private navStore: NavStore
  ) {}

  ngOnInit() {
    let folderName: string;

    this.createFolderForm = this.fb.group({
      folderName: [folderName, [Validators.required, Validators.maxLength(255)]]
    });
  }

  create() {
    this.createFolderForm.markAllAsTouched();

    if (!this.createFolderForm.valid) {
      return;
    }

    this.ref.close();

    let folderName = this.createFolderForm.value.folderName.toLowerCase();

    let payload: apiToBackend.ToBackendCreateFolderRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      parentNodeId: this.ref.data.parentNodeId,
      folderName: folderName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFolder,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateFolderResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
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
