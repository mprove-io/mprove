import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ValidationService } from '~front/app/services/validation.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface CreateFileDialogDataItem {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
}

@Component({
  selector: 'm-create-file-dialog',
  templateUrl: './create-file-dialog.component.html'
})
export class CreateFileDialogComponent implements OnInit {
  createFileForm: FormGroup;

  extList = constants.EXT_LIST;

  fileExt = common.FileExtensionEnum.View;

  constructor(
    public ref: DialogRef<CreateFileDialogDataItem>,
    private fb: FormBuilder,
    private repoStore: RepoStore,
    public structStore: StructStore,
    private navigateService: NavigateService,
    private navStore: NavStore,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let fileName: string;

    this.createFileForm = this.fb.group({
      fileName: [
        fileName,
        [
          Validators.required,
          ValidationService.fileNameWrongChars,
          Validators.maxLength(255)
        ]
      ],
      fileExt: [this.fileExt]
    });
  }

  extChange(fileExt: common.FileExtensionEnum) {
    this.fileExt = fileExt;
    this.cd.detectChanges();
  }

  create() {
    this.createFileForm.markAllAsTouched();

    if (!this.createFileForm.valid) {
      return;
    }

    this.ref.close();

    let fileName =
      this.createFileForm.value.fileName + this.createFileForm.value.fileExt;

    fileName = fileName.toLowerCase();

    let payload: apiToBackend.ToBackendCreateFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      parentNodeId: this.ref.data.parentNodeId,
      fileName: fileName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateFileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            let fId = this.ref.data.parentNodeId + '/' + fileName;
            let fIdAr = fId.split('/');
            fIdAr.shift();
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
