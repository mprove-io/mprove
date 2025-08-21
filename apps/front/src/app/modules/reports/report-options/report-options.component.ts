import { Component, Input } from '@angular/core';
import { PanelEnum } from '~common/enums/panel.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { ReportX } from '~common/interfaces/backend/report-x';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-report-options',
  templateUrl: './report-options.component.html'
})
export class ReportOptionsComponent {
  @Input()
  report: ReportX;

  @Input()
  isHoverM: boolean;

  constructor(
    private navigateService: NavigateService,
    private apiService: ApiService,
    private reportQuery: ReportQuery,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private myDialogService: MyDialogService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event: MouseEvent) {
    event.stopPropagation();

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = this.report.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath }),
      lineNumber: 0
    });
  }

  async editReportInfo(event: MouseEvent, item: ReportX) {
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
