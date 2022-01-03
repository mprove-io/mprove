import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardState } from '~front/app/stores/dashboard.store';
import { common } from '~front/barrels/common';
import { constants as frontConstants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  pageTitle = frontConstants.DASHBOARD_PAGE_TITLE;

  filtersIsExpanded = false;

  showBricks = false;

  isShow = true;

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
        x: report.tileX || 0,
        y: report.tileY || 0,
        w: report.tileWidth || 3,
        h: report.tileHeight || 3,
        report: report
      }));

      this.cd.detectChanges();
    })
  );

  extendedFilters: interfaces.FilterExtended[];
  extendedFilters$ = this.dashboardQuery.extendedFilters$.pipe(
    tap(x => {
      this.extendedFilters = x;
      this.cd.detectChanges();
    })
  );

  cols = 24;
  rowHeight = 50;
  layout: any = [
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
    public navigateService: NavigateService,
    private cd: ChangeDetectorRef
  ) {}

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
  }

  onLayoutUpdated(x: any) {}

  trackByFn(index: number, item: any) {
    return item.report.mconfigId;
  }

  goToFile() {
    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  toggleShowReportFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  canDeactivate(): Promise<boolean> | boolean {
    // console.log('canDeactivateDashboard')
    // this.mqStore.reset();
    // this.modelStore.reset();
    return true;
  }
}
