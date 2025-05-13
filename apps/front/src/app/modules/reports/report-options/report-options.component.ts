import { Component, Input } from '@angular/core';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-report-options',
  templateUrl: './report-options.component.html'
})
export class ReportOptionsComponent {
  @Input()
  report: common.ReportX;

  @Input()
  isHoverM: boolean;

  constructor(
    private navigateService: NavigateService,
    private apiService: ApiService,
    private reportQuery: ReportQuery,
    private navQuery: NavQuery,
    private myDialogService: MyDialogService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.report.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: 0
    });
  }

  async editReportInfo(event: MouseEvent, item: common.ReportX) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showEditReportInfo({
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      report: item
    });
  }

  deleteReport(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showDeleteReport({
      report: this.report,
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      isStartSpinnerUntilNavEnd:
        this.reportQuery.getValue().reportId === this.report.reportId
    });
  }
}
