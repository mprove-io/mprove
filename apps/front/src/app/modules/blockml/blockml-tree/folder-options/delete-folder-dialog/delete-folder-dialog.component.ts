import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-delete-folder-dialog',
  templateUrl: './delete-folder-dialog.component.html'
})
export class DeleteFolderDialogComponent {
  constructor(public ref: DialogRef, private repoStore: RepoStore) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteFolderRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      folderNodeId: this.ref.data.folderNodeId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFolder,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteFolderResponse) => {
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
