import { Component, Input } from '@angular/core';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportsQuery } from '~front/app/queries/reports.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-report-options',
  templateUrl: './report-options.component.html'
})
export class ReportOptionsComponent {
  @Input()
  report: common.ReportX;

  reportDeletedFnBindThis = this.reportDeletedFn.bind(this);

  constructor(
    private navigateService: NavigateService,
    private apiService: ApiService,
    private reportQuery: ReportQuery,
    private reportsQuery: ReportsQuery,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private myDialogService: MyDialogService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFileLine(event: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.report.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: 0
    });
  }

  deleteReport(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();
    let selectedReport = this.reportQuery.getValue();

    this.myDialogService.showDeleteReport({
      report: this.report,
      apiService: this.apiService,
      reportDeletedFnBindThis: this.reportDeletedFnBindThis,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      isStartSpinnerUntilNavEnd:
        selectedReport.reportId === this.report.reportId
    });
  }

  reportDeletedFn(deletedReportId: string) {
    let selectedReport = this.reportQuery.getValue();
    let reports = this.reportsQuery.getValue().reports;

    let reportIndex = reports.findIndex(x => x.reportId === deletedReportId);

    let newReports = [
      ...reports.slice(0, reportIndex),
      ...reports.slice(reportIndex + 1)
    ];

    this.reportsQuery.update({ reports: newReports });

    let uiState = this.uiQuery.getValue();

    if (selectedReport.reportId === deletedReportId) {
      uiState.gridApi.deselectAll();

      this.navigateService.navigateToMetricsRep({
        reportId: common.EMPTY_REPORT_ID
      });
    }
  }
}
