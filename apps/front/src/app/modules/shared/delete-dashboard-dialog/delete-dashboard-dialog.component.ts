import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { DashboardUnit } from '#common/types/backend/parts/dashboard/dashboard-unit';
import type { ToBackendDeleteDashboardOutput } from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-output';
import type { ToBackendDeleteDashboardRequest } from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-request';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { DashboardUnitsQuery } from '#front/app/queries/dashboard-units.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SpinnerService } from '#front/app/services/spinner.service';
import { UiService } from '#front/app/services/ui.service';

export interface DeleteDashboardDialogData {
  apiService: ApiService;
  dashboardUnit: DashboardUnit;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  repoType: RepoType;
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
    private spinnerService: SpinnerService,
    public ref: DialogRef<DeleteDashboardDialogData>,
    private dashboardUnitsQuery: DashboardUnitsQuery,
    private dashboardQuery: DashboardQuery,
    private navigateService: NavigateService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let { projectId, branchId, repoId } = this.ref.data;

    let dashboardUnit: DashboardUnit = this.ref.data.dashboardUnit;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendDeleteDashboardRequest['input'] = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      repoId: repoId,
      dashboardId: dashboardUnit.dashboardId
    };

    apiService
      .req({
        route: 'api/ToBackendDeleteDashboard',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteDashboardOutput = resp.output;

          this.dashboardUnitsQuery.update({
            dashboardUnitDrafts: output.dashboardUnitDrafts,
            dashboardSpaceNodes: output.dashboardSpaceNodes
          });

          let currentDashboard = this.dashboardQuery.getValue();

          if (currentDashboard.dashboardId === dashboardUnit.dashboardId) {
            this.uiService.clearProjectDashboardLink();
            this.navigateService.navigateToDashboards();
          }
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
