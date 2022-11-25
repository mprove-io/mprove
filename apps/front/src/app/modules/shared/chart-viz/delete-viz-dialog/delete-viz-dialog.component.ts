import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteVizDialogDataItem {
  apiService: ApiService;
  vizDeletedFnBindThis: any;
  viz: common.Viz;
  projectId: string;
  branchId: string;
  envId: string;
  isRepoProd: boolean;
}

@Component({
  selector: 'm-delete-viz-dialog',
  templateUrl: './delete-viz-dialog.component.html'
})
export class DeleteVizDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteVizDialogDataItem>,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

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
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteViz,
        payload: payload,
        showSpinner: true
      })
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
