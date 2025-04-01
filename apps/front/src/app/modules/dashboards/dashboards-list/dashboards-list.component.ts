import { ChangeDetectorRef, Component } from '@angular/core';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

import { tap } from 'rxjs/operators';
import { FilteredDashboardsQuery } from '~front/app/queries/filtered-dashboards.query';

@Component({
  selector: 'm-dashboards-list',
  templateUrl: './dashboards-list.component.html'
})
export class DashboardsListComponent {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  filteredDashboards: common.DashboardX[];
  filteredDashboards$ = this.filteredDashboardsQuery.select().pipe(
    tap(x => {
      this.filteredDashboards = x.filteredDashboards.filter(
        d => d.draft === false
      );
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private filteredDashboardsQuery: FilteredDashboardsQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService
  ) {}

  navigateToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard(dashboardId);
  }

  rowMenuOnClick(event: any) {
    event.stopPropagation();
  }

  goToDashboardFile(event: any, dashboard: common.DashboardX) {
    event.stopPropagation();

    let fileIdAr = dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  deleteDashboard(event: MouseEvent, item: common.DashboardX) {
    event.stopPropagation();

    this.myDialogService.showDeleteDashboard({
      dashboard: item,
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      isStartSpinnerUntilNavEnd: false
    });
  }

  trackByFn(index: number, item: common.DashboardX) {
    return item.dashboardId;
  }
}
