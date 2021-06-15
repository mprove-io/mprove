import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-delete-branch-dialog',
  templateUrl: './delete-branch-dialog.component.html'
})
export class DeleteBranchDialogComponent {
  repoName =
    this.ref.data.isRepoProd === true
      ? common.PROD_REPO_ID
      : this.ref.data.alias;

  constructor(public ref: DialogRef, private router: Router) {}

  delete() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteBranchRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteBranch,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendDeleteBranchResponse) => {
          this.router.navigate([
            common.PATH_ORG,
            this.ref.data.orgId,
            common.PATH_PROJECT,
            this.ref.data.projectId,
            common.PATH_REPO,
            common.PROD_REPO_ID,
            common.PATH_BRANCH,
            common.BRANCH_MASTER,
            common.PATH_BLOCKML
          ]);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}