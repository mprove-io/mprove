import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface RenameFolderDialogDataItem {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  nodeId: string;
  folderName: string;
}

@Component({
  selector: 'm-rename-folder-dialog',
  templateUrl: './rename-folder-dialog.component.html'
})
export class RenameFolderDialogComponent implements OnInit {
  renameFolderForm: FormGroup;

  constructor(
    public ref: DialogRef<RenameFolderDialogDataItem>,
    private fb: FormBuilder,
    private navigateService: NavigateService,
    private repoStore: RepoStore,
    private navStore: NavStore,
    public structStore: StructStore
  ) {}

  ngOnInit() {
    this.renameFolderForm = this.fb.group({
      folderName: [
        this.ref.data.folderName,
        [Validators.required, Validators.maxLength(255)]
      ]
    });
  }

  save() {
    this.renameFolderForm.markAllAsTouched();

    if (!this.renameFolderForm.valid) {
      return;
    }

    this.ref.close();

    let newName = this.renameFolderForm.value.folderName.toLowerCase();

    let payload: apiToBackend.ToBackendRenameCatalogNodeRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      nodeId: this.ref.data.nodeId,
      newName: newName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendRenameCatalogNodeResponse) => {
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
