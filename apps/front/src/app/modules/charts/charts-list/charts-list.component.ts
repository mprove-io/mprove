import { ChangeDetectorRef, Component } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

import { FilteredChartsQuery } from '~front/app/queries/filtered-charts.query';

@Component({
  selector: 'm-charts-list',
  templateUrl: './charts-list.component.html'
})
export class ChartsListComponent {
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

  filteredCharts: common.ChartX[];
  filteredCharts$ = this.filteredChartsQuery.select().pipe(
    tap(x => {
      this.filteredCharts = x.filteredCharts.filter(d => d.draft === false);
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

  navigateToChart(item: common.ChartX) {
    this.navigateService.navigateMconfigQuery({
      modelId: item.modelId,
      mconfigId: item.tiles[0].mconfigId,
      queryId: item.tiles[0].queryId
    });
  }

  rowMenuOnClick(event: any) {
    event.stopPropagation();
  }

  goToChartFile(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    let fileIdAr = item.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  async editChartInfo(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    let payloadGetMconfig: apiToBackend.ToBackendGetMconfigRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      mconfigId: item.tiles[0].mconfigId
    };

    let mconfig: common.MconfigX = await this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
        payload: payloadGetMconfig
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetMconfigResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            return resp.payload.mconfig;
          }
        })
      )
      .toPromise();

    if (common.isUndefined(mconfig)) {
      return;
    }

    this.myDialogService.showEditChartInfo({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      chart: item,
      mconfig: mconfig
    });
  }

  deleteChart(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    this.myDialogService.showDeleteChart({
      chart: item,
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd
    });
  }

  trackByFn(index: number, item: common.ChartX) {
    return item.chartId;
  }
}
