import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { spaceUnitToDashboardUnit } from '#common/functions/space/space-unit-to-dashboard-unit';
import type { DashboardPart } from '#common/zod/backend/dashboard-part';
import type { SpaceUnit } from '#common/zod/backend/space-unit';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-dashboard-options',
  templateUrl: './dashboard-options.component.html'
})
export class DashboardOptionsComponent {
  @Input()
  set dashboardPart(dashboardPart: DashboardPart) {
    this.currentDashboardPart = dashboardPart;
  }

  @Input()
  set spaceUnit(spaceUnit: SpaceUnit) {
    this.currentDashboardPart = spaceUnitToDashboardUnit({
      spaceUnit: spaceUnit
    });
  }

  @Input()
  isHoverM: boolean;

  currentDashboardPart: DashboardPart;

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

    let fileIdAr = this.currentDashboardPart.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
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
      repoId: nav.repoId,
      repoType: nav.repoType,
      dashboardPart: item
    });
  }

  deleteDashboard(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showDeleteDashboard({
      dashboardPart: this.currentDashboardPart,
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      repoId: nav.repoId,
      repoType: nav.repoType,
      isStartSpinnerUntilNavEnd:
        this.dashboardQuery.getValue().dashboardId ===
        this.currentDashboardPart.dashboardId
    });
  }
}
