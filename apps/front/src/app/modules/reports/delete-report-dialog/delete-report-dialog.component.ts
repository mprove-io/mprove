import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { ReportUnit } from '#common/types/backend/parts/report/report-unit';
import type { ToBackendDeleteReportOutput } from '#common/types/backend/routes/reports/delete-report/delete-report-output';
import type { ToBackendDeleteReportRequest } from '#common/types/backend/routes/reports/delete-report/delete-report-request';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import { ReportQuery } from '#front/app/queries/report.query';
import { ReportsQuery } from '#front/app/queries/reports.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SpinnerService } from '#front/app/services/spinner.service';
import { UiService } from '#front/app/services/ui.service';

export interface DeleteReportDialogData {
  apiService: ApiService;
  report: ReportUnit;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  repoType: RepoType;
}

@Component({
  selector: 'm-delete-report-dialog',
  templateUrl: './delete-report-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteReportDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    private spinnerService: SpinnerService,
    public ref: DialogRef<DeleteReportDialogData>,
    private reportsQuery: ReportsQuery,
    private reportQuery: ReportQuery,
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

    let report: ReportUnit = this.ref.data.report;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendDeleteReportRequest['input'] = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      repoId: repoId,
      reportId: report.reportId
    };

    apiService
      .req({
        route: 'api/ToBackendDeleteReport',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteReportOutput = resp.output;

          this.reportsQuery.update({
            reportUnitDrafts: output.reportUnitDrafts,
            reportSpaceNodes: output.reportSpaceNodes
          });

          let currentReport = this.reportQuery.getValue();

          if (currentReport.reportId === report.reportId) {
            this.uiService.clearProjectReportLink();
            this.navigateService.navigateToReports();
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
