import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-dashboard-options',
  templateUrl: './dashboard-options.component.html'
})
export class DashboardOptionsComponent {
  @Input()
  dashboard: common.DashboardX;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  // @Output()
  // runDryEvent = new EventEmitter();

  constructor(
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private dashboardQuery: DashboardQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event?: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  deleteDashboard(event: MouseEvent) {
    event.stopPropagation();

    this.myDialogService.showDeleteDashboard({
      dashboard: this.dashboard,
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      isStartSpinnerUntilNavEnd:
        this.dashboardQuery.getValue().dashboardId ===
        this.dashboard.dashboardId
    });
  }
}
