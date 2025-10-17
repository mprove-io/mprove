import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CHARTS_LIST_PAGE_TITLE } from '~common/constants/page-titles';
import { ChartX } from '~common/interfaces/backend/chart-x';
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
    // this.navigateService.navigateMconfigQuery({
    //   modelId: chartItem.modelId,
    //   mconfigId: chartItem.tiles[0].mconfigId,
    //   queryId: chartItem.tiles[0].queryId
    // });
    this.navigateService.navigateToChart({
      modelId: chartItem.modelId,
      chartId: chartItem.chartId
    });
  }

  // rowMenuOnClick(event: any) {
  //   event.stopPropagation();
  // }

  // goToChartFile(event: MouseEvent, item: ChartX) {
  //   event.stopPropagation();

  //   let fileIdAr = item.filePath.split('/');
  //   fileIdAr.shift();

  //   this.navigateService.navigateToFileLine({
  //     panel: PanelEnum.Tree,
  //     encodedFileId:
  //   });
  // }

  // deleteChart(event: MouseEvent, item: ChartX) {
  //   event.stopPropagation();

  //   this.myDialogService.showDeleteChart({
  //     chart: item,
  //     apiService: this.apiService,
  //     projectId: this.nav.projectId,
  //     branchId: this.nav.branchId,
  //     envId: this.nav.envId,
  //     isRepoProd: this.nav.isRepoProd
  //   });
  // }

  trackByFn(index: number, item: ChartX) {
    return item.chartId;
  }
}
