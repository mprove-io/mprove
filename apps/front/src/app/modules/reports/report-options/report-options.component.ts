import { Component, Input } from '@angular/core';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { spaceUnitToReportUnit } from '#common/functions/space/space-unit-to-report-unit';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import { NavQuery } from '#front/app/queries/nav.query';
import { ReportQuery } from '#front/app/queries/report.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-report-options',
  templateUrl: './report-options.component.html'
})
export class ReportOptionsComponent {
  @Input()
  set reportUnit(reportUnit: ReportUnit) {
    this.currentReportUnit = reportUnit;
  }

  @Input()
  set spaceUnit(spaceUnit: SpaceUnit) {
    this.currentReportUnit = spaceUnitToReportUnit({
      spaceUnit: spaceUnit
    });
  }

  @Input()
  isHoverM: boolean;

  currentReportUnit: ReportUnit;

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

    let fileIdAr = (this.currentReportUnit.filePath ?? '').split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath }),
      lineNumber: 0
    });
  }

  async editReportInfo(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showEditReportInfo({
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      repoId: nav.repoId,
      repoType: nav.repoType,
      report: this.currentReportUnit
    });
  }

  deleteReport(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showDeleteReport({
      report: this.currentReportUnit,
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      repoId: nav.repoId,
      repoType: nav.repoType,
      isStartSpinnerUntilNavEnd:
        this.reportQuery.getValue().reportId === this.currentReportUnit.reportId
    });
  }
}
