import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import {
  ToBackendDeleteDashboardRequestPayload,
  ToBackendDeleteDashboardResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-delete-dashboard';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { DashboardPartsQuery } from '~front/app/queries/dashboard-parts.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

export interface DeleteDashboardDialogData {
  apiService: ApiService;
  dashboardPart: DashboardPart;
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
    private dashboardPartsQuery: DashboardPartsQuery,
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

    let dashboardPart: DashboardPart = this.ref.data.dashboardPart;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendDeleteDashboardRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      dashboardId: dashboardPart.dashboardId
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
            let dashboardParts =
              this.dashboardPartsQuery.getValue().dashboardParts;

            this.dashboardPartsQuery.update({
              dashboardParts: dashboardParts.filter(
                d => d.dashboardId !== dashboardPart.dashboardId
              )
            });

            let currentDashboard = this.dashboardQuery.getValue();

            if (currentDashboard.dashboardId === dashboardPart.dashboardId) {
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
