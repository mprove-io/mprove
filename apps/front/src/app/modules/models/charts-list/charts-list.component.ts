import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CHARTS_LIST_PAGE_TITLE } from '#common/constants/page-titles';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { FilteredChartsQuery } from '~front/app/queries/filtered-charts.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-charts-list',
  templateUrl: './charts-list.component.html'
})
export class ChartsListComponent {
  pageTitle = CHARTS_LIST_PAGE_TITLE;

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

  filteredCharts: ChartX[];
  filteredCharts$ = this.filteredChartsQuery.select().pipe(
    tap(x => {
      this.filteredCharts = x.filteredCharts.filter(d => d.draft === false);
      this.cd.detectChanges();
    })
  );

  showModelId = true;

  constructor(
    private cd: ChangeDetectorRef,
    private filteredChartsQuery: FilteredChartsQuery,
    private memberQuery: MemberQuery,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService
  ) {}

  setShowModelIdTrue() {
    this.showModelId = true;
  }

  setShowModelIdFalse() {
    this.showModelId = false;
  }

  navigateToChart(chartItem: ChartX) {
    this.navigateService.navigateToChart({
      modelId: chartItem.modelId,
      chartId: chartItem.chartId
    });
  }

  trackByFn(index: number, item: ChartX) {
    return item.chartId;
  }
}
