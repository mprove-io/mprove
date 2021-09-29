import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-rename-file-dialog',
  templateUrl: './rename-file-dialog.component.html'
})
export class RenameFileDialogComponent implements OnInit {
  renameFileForm: FormGroup;

  extList = constants.EXT_LIST;

  fileExt = common.FileExtensionEnum.View;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private repoStore: RepoStore,
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
        nameArray.join('.'),
        [Validators.required, Validators.maxLength(255)]
      ],
      fileExt: [this.fileExt]
    });
  }

  extChange(fileExt: common.FileExtensionEnum) {
    this.fileExt = fileExt;
    this.cd.detectChanges();
  }

  save() {
    this.renameFileForm.markAllAsTouched();

    if (!this.renameFileForm.valid) {
      return;
    }

    this.ref.close();

    let newName =
      this.renameFileForm.value.fileName + this.renameFileForm.value.fileExt;
    newName = newName.toLowerCase();

    let payload: apiToBackend.ToBackendRenameCatalogNodeRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
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
          this.repoStore.update(resp.payload.repo);
          this.structStore.update(resp.payload.struct);

          let fIdAr = this.ref.data.nodeId.split('/');
          fIdAr.shift();
          fIdAr.pop();
          fIdAr.push(newName);
          let fileId = fIdAr.join(common.TRIPLE_UNDERSCORE);

          this.navigateService.navigateToFileLine({
            underscoreFileId: fileId
          });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
