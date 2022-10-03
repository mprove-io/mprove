import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

export interface RenameFileDialogDataItem {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  nodeId: string;
  fileName: string;
}

@Component({
  selector: 'm-rename-file-dialog',
  templateUrl: './rename-file-dialog.component.html'
})
export class RenameFileDialogComponent implements OnInit {
  renameFileForm: FormGroup;

  constructor(
    public ref: DialogRef<RenameFileDialogDataItem>,
    private fb: FormBuilder,
    private repoStore: RepoStore,
    private navStore: NavStore,
    private navigateService: NavigateService,
    public structStore: StructStore,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let nameArray = this.ref.data.fileName.split('.');
    if (nameArray.length > 1) {
      nameArray.pop();
    }

    this.renameFileForm = this.fb.group({
      fileName: [
        this.ref.data.fileName,
        [Validators.required, Validators.maxLength(255)]
      ]
    });
  }

  save() {
    this.renameFileForm.markAllAsTouched();

    if (!this.renameFileForm.valid) {
      return;
    }

    this.ref.close();

    let newName = this.renameFileForm.value.fileName;
    newName = newName.toLowerCase();

    let payload: apiToBackend.ToBackendRenameCatalogNodeRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      nodeId: this.ref.data.nodeId,
      newName: newName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode,
        payload
      )
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

            let fIdAr = this.ref.data.nodeId.split('/');
            fIdAr.shift();
            fIdAr.pop();
            fIdAr.push(newName);
            let fileId = fIdAr.join(common.TRIPLE_UNDERSCORE);

            this.navigateService.navigateToFileLine({
              underscoreFileId: fileId
            });
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
