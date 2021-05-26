import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html'
})
export class CreateFolderDialogComponent implements OnInit {
  createFolderForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    public structStore: StructStore,
    private repoStore: RepoStore
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

    let payload: apiToBackend.ToBackendCreateFolderRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      parentNodeId: this.ref.data.parentNodeId,
      folderName: this.createFolderForm.value.folderName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFolder,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateFolderResponse) => {
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
