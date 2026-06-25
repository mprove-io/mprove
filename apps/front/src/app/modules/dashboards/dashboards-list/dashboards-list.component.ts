import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import { DashboardUnitsFilteredQuery } from '#front/app/queries/dashboard-parts-filtered.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { NavigateService } from '#front/app/services/navigate.service';

type DashboardListItem = DashboardUnit;

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

  dashboardUnitsFiltered: DashboardListItem[];
  dashboardUnitsFiltered$ = this.dashboardUnitsFilteredQuery.select().pipe(
    tap(x => {
      this.dashboardUnitsFiltered = x.dashboardUnitsFiltered.filter(
        d => d.draft === false
      );
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private dashboardUnitsFilteredQuery: DashboardUnitsFilteredQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService
  ) {}

  navigateToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard({ dashboardId: dashboardId });
  }

  trackByFn(index: number, item: DashboardListItem) {
    return item.dashboardId;
  }
}
