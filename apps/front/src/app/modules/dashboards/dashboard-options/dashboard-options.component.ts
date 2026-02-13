import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { PanelEnum } from '#common/enums/panel.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-dashboard-options',
  templateUrl: './dashboard-options.component.html'
})
export class DashboardOptionsComponent {
  @Input()
  dashboardPart: DashboardPart;

  @Input()
  isHoverM: boolean;

  constructor(
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private dashboardQuery: DashboardQuery,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private uiService: UiService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event?: MouseEvent) {
    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    event.stopPropagation();

    let fileIdAr = this.dashboardPart.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.uiService.ensureFilesLeftPanel();
    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  async editDashboardInfo(event: MouseEvent, item: DashboardPart) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showEditDashboardInfo({
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      dashboardPart: item
    });
  }

  deleteDashboard(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showDeleteDashboard({
      dashboardPart: this.dashboardPart,
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      isStartSpinnerUntilNavEnd:
        this.dashboardQuery.getValue().dashboardId ===
        this.dashboardPart.dashboardId
    });
  }
}
