import { Component, EventEmitter } from '@angular/core';
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
    let vizDeleted: EventEmitter<string> = this.ref.data.vizDeleted;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendDeleteVizRequestPayload = {
      projectId: projectId,
      branchId: branchId,
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
          vizDeleted.emit(viz.vizId);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}