import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { FilteredDashboardsQuery } from '~front/app/queries/filtered-dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
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

  filteredDashboards: DashboardX[];
  filteredDashboards$ = this.filteredDashboardsQuery.select().pipe(
    tap(x => {
      this.filteredDashboards = x.filteredDashboards.filter(
        d => d.draft === false
      );
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private filteredDashboardsQuery: FilteredDashboardsQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService
  ) {}

  navigateToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard({ dashboardId: dashboardId });
  }

  trackByFn(index: number, item: DashboardX) {
    return item.dashboardId;
  }
}
