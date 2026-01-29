import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import { DashboardPartsFilteredQuery } from '#front/app/queries/dashboard-parts-filtered.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { NavigateService } from '#front/app/services/navigate.service';

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

  dashboardPartsFiltered: DashboardPart[];
  dashboardPartsFiltered$ = this.dashboardPartsFilteredQuery.select().pipe(
    tap(x => {
      this.dashboardPartsFiltered = x.dashboardPartsFiltered.filter(
        d => d.draft === false
      );
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private dashboardPartsFilteredQuery: DashboardPartsFilteredQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService
  ) {}

  navigateToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard({ dashboardId: dashboardId });
  }

  trackByFn(index: number, item: DashboardPart) {
    return item.dashboardId;
  }
}
