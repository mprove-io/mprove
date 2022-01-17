import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-delete-dashboard-dialog',
  templateUrl: './delete-dashboard-dialog.component.html'
})
export class DeleteDashboardDialogComponent {
  constructor(public ref: DialogRef, private router: Router) {}

  delete() {
    this.ref.close();

    let { projectId, branchId, isRepoProd } = this.ref.data;

    let dashboard: common.Dashboard = this.ref.data.dashboard;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendDeleteDashboardRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      isRepoProd: isRepoProd,
      dashboardId: dashboard.dashboardId
    };

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteDashboardResponse) => {
          this.ref.data.dashboardDeletedFnBindThis(dashboard.dashboardId);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
