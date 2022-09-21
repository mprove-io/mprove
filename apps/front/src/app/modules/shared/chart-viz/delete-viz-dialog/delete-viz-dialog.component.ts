import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-delete-viz-dialog',
  templateUrl: './delete-viz-dialog.component.html'
})
export class DeleteVizDialogComponent {
  constructor(public ref: DialogRef, private router: Router) {}

  delete() {
    this.ref.close();

    let { projectId, branchId, isRepoProd } = this.ref.data;

    let viz: common.Viz = this.ref.data.viz;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendDeleteVizRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      vizId: viz.vizId
    };

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteViz,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteVizResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.ref.data.vizDeletedFnBindThis(viz.vizId);
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
