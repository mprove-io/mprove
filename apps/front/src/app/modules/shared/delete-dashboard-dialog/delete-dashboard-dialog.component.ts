import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteDashboardDialogDataItem {
  apiService: ApiService;
  dashboardDeletedFnBindThis: any;
  dashboard: common.Dashboard;
  projectId: string;
  branchId: string;
  envId: string;
  isRepoProd: boolean;
  isStartSpinnerUntilNavEnd: boolean;
}

@Component({
  selector: 'm-delete-dashboard-dialog',
  templateUrl: './delete-dashboard-dialog.component.html'
})
export class DeleteDashboardDialogComponent {
  constructor(
    public ref: DialogRef<DeleteDashboardDialogDataItem>,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  delete() {
    let urlPart = this.router.url.split('?')[0];
    let urlPartArray = urlPart.split('/');

    if (this.ref.data.isStartSpinnerUntilNavEnd === true) {
      this.spinner.show(constants.APP_SPINNER_NAME);
    }

    this.ref.close();

    let { projectId, branchId, isRepoProd } = this.ref.data;

    let dashboard: common.Dashboard = this.ref.data.dashboard;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendDeleteDashboardRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      dashboardId: dashboard.dashboardId
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard,
        payload: payload,
        showSpinner: !this.ref.data.isStartSpinnerUntilNavEnd
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.ref.data.dashboardDeletedFnBindThis(dashboard.dashboardId);
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
