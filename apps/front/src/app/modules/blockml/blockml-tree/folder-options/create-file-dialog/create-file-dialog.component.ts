import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-create-file-dialog',
  templateUrl: './create-file-dialog.component.html'
})
export class CreateFileDialogComponent implements OnInit {
  createFileForm: FormGroup;
  extList: common.FileExtensionEnum[] = [
    common.FileExtensionEnum.View,
    common.FileExtensionEnum.Model,
    common.FileExtensionEnum.Dashboard,
    common.FileExtensionEnum.Viz,
    common.FileExtensionEnum.Udf,
    common.FileExtensionEnum.Conf,
    common.FileExtensionEnum.Md
  ];

  fileExt = common.FileExtensionEnum.View;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private repoStore: RepoStore,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let fileName: string;

    this.createFileForm = this.fb.group({
      fileName: [fileName, [Validators.required, Validators.maxLength(255)]],
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

    let payload: apiToBackend.ToBackendCreateFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      parentNodeId: this.ref.data.parentNodeId,
      fileName:
        this.createFileForm.value.fileName + this.createFileForm.value.fileExt
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateFileResponse) => {
          this.repoStore.update(resp.payload.repo);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
