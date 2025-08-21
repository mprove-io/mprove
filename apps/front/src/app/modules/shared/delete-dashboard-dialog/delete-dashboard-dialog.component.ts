import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

export interface DeleteDashboardDialogData {
  apiService: ApiService;
  dashboard: Dashboard;
  projectId: string;
  branchId: string;
  envId: string;
  isRepoProd: boolean;
  isStartSpinnerUntilNavEnd: boolean;
}

@Component({
  selector: 'm-delete-dashboard-dialog',
  templateUrl: './delete-dashboard-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteDashboardDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteDashboardDialogData>,
    private spinner: NgxSpinnerService,
    private router: Router,
    private dashboardsQuery: DashboardsQuery,
    private dashboardQuery: DashboardQuery,
    private navigateService: NavigateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    if (this.ref.data.isStartSpinnerUntilNavEnd === true) {
      this.spinner.show(APP_SPINNER_NAME);
    }

    this.ref.close();

    let { projectId, branchId, isRepoProd } = this.ref.data;

    let dashboard: Dashboard = this.ref.data.dashboard;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendDeleteDashboardRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      dashboardId: dashboard.dashboardId
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard,
        payload: payload,
        showSpinner: !this.ref.data.isStartSpinnerUntilNavEnd
      })
      .pipe(
        tap((resp: ToBackendDeleteDashboardResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let dashboards = this.dashboardsQuery.getValue().dashboards;

            this.dashboardsQuery.update({
              dashboards: dashboards.filter(
                d => d.dashboardId !== dashboard.dashboardId
              )
            });

            let currentDashboard = this.dashboardQuery.getValue();

            if (currentDashboard.dashboardId === dashboard.dashboardId) {
              this.navigateService.navigateToDashboards();
            }
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
