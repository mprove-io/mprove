import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-delete-file-dialog',
  templateUrl: './delete-file-dialog.component.html'
})
export class DeleteFileDialogComponent {
  constructor(
    public ref: DialogRef,
    private repoStore: RepoStore,
    public structStore: StructStore
  ) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      fileNodeId: this.ref.data.fileNodeId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFile,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteFileResponse) => {
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