import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-rename-folder-dialog',
  templateUrl: './rename-folder-dialog.component.html'
})
export class RenameFolderDialogComponent implements OnInit {
  renameFolderForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private navigateService: NavigateService,
    private repoStore: RepoStore,
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

          this.navigateService.navigateToFiles();
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
