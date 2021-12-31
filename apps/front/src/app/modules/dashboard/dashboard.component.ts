import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { KtdGridLayout } from '@katoid/angular-grid-layout';
import { tap } from 'rxjs/operators';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { DashboardState } from '~front/app/stores/dashboard.store';
import { constants as frontConstants } from '~front/barrels/constants';

@Component({
  selector: 'm-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  pageTitle = frontConstants.DASHBOARD_PAGE_TITLE;

  dashboard: DashboardState;
  dashboard$ = this.dashboardQuery.select().pipe(
    tap(x => {
      this.dashboard = x;
      this.title.setTitle(
        `${this.pageTitle} - ${
          this.dashboard?.title || this.dashboard?.dashboardId
        }`
      );

      this.layout = this.dashboard.reports.map(report => ({
        id: report.mconfigId,
        x: 0,
        y: 0,
        w: 3,
        h: 3,
        report: report
      }));

      this.cd.detectChanges();
    })
  );

  cols = 12;
  rowHeight = 50;
  layout: KtdGridLayout = [
    // {id: '0', x: 0, y: 0, w: 3, h: 3},
    // {id: '1', x: 3, y: 0, w: 3, h: 3},
    // {id: '2', x: 0, y: 3, w: 3, h: 3},
    // {id: '3', x: 3, y: 3, w: 3, h: 3},
    // { id: '0', x: 0, y: 0, w: 3, h: 3 },
    // { id: '1', x: 0, y: 0, w: 3, h: 3 },
    // { id: '2', x: 0, y: 0, w: 3, h: 3 },
    // { id: '3', x: 0, y: 0, w: 3, h: 3 }
  ];
  trackById = 'id';

  constructor(
    private dashboardQuery: DashboardQuery,
    private title: Title,
    private cd: ChangeDetectorRef
  ) {}

  onLayoutUpdated(x: any) {}

  canDeactivate(): Promise<boolean> | boolean {
    // console.log('canDeactivateDashboard')
    // this.mqStore.reset();
    // this.modelStore.reset();
    return true;
  }
}
