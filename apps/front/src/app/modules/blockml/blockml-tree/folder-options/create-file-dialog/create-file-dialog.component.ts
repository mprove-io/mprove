import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-create-file-dialog',
  templateUrl: './create-file-dialog.component.html'
})
export class CreateFileDialogComponent implements OnInit {
  createFileForm: FormGroup;

  extList = constants.EXT_LIST;

  fileExt = common.FileExtensionEnum.View;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private repoStore: RepoStore,
    public structStore: StructStore,
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
          this.structStore.update(resp.payload.struct);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
