import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-dashboard-options',
  templateUrl: './dashboard-options.component.html'
})
export class DashboardOptionsComponent {
  @Input()
  dashboard: common.DashboardX;

  @Input()
  isHoverM: boolean;

  // @Output()
  // runDryEvent = new EventEmitter();

  constructor(
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private dashboardQuery: DashboardQuery,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event?: MouseEvent) {
    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    event.stopPropagation();

    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: common.encodeFilePath({ filePath: filePath })
      // underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  async editDashboardInfo(event: MouseEvent, item: common.DashboardX) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showEditDashboardInfo({
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      dashboard: item
    });
  }

  deleteDashboard(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showDeleteDashboard({
      dashboard: this.dashboard,
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      isStartSpinnerUntilNavEnd:
        this.dashboardQuery.getValue().dashboardId ===
        this.dashboard.dashboardId
    });
  }
}
