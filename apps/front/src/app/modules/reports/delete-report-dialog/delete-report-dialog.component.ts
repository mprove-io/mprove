import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { ToBackendDeleteReportRequest } from '#common/zod/backend/routes/reports/delete-report/delete-report-request';
import type { ToBackendDeleteReportResponse } from '#common/zod/backend/routes/reports/delete-report/delete-report-response';
import { ReportQuery } from '#front/app/queries/report.query';
import { ReportsQuery } from '#front/app/queries/reports.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

export interface DeleteReportDialogData {
  apiService: ApiService;
  report: ReportUnit;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  repoType: RepoTypeEnum;
  isStartSpinnerUntilNavEnd: boolean;
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
    public ref: DialogRef<DeleteReportDialogData>,
    private spinner: NgxSpinnerService,
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
    if (this.ref.data.isStartSpinnerUntilNavEnd === true) {
      this.spinner.show(APP_SPINNER_NAME);
    }

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
        payload: payload,
        showSpinner: !this.ref.data.isStartSpinnerUntilNavEnd
      })
      .pipe(
        tap((resp: ToBackendDeleteReportResponse) => {
          if (resp?.type === 'Success') {
            this.reportsQuery.update({
              reportUnitDrafts: resp.output.reportUnitDrafts,
              reportSpaceNodes: resp.output.reportSpaceNodes
            });

            let currentReport = this.reportQuery.getValue();

            if (currentReport.reportId === report.reportId) {
              this.uiService.clearProjectReportLink();
              this.navigateService.navigateToReports();
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
