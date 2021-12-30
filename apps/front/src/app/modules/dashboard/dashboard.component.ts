import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
      this.cd.detectChanges();
    })
  );

  constructor(
    private dashboardQuery: DashboardQuery,
    private title: Title,
    private cd: ChangeDetectorRef
  ) {}

  canDeactivate(): Promise<boolean> | boolean {
    // console.log('canDeactivateDashboard')
    // this.mqStore.reset();
    // this.modelStore.reset();
    return true;
  }
}
