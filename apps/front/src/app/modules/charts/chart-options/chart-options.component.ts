import { Component, Input } from '@angular/core';
import { map } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-options',
  templateUrl: './chart-options.component.html'
})
export class ChartOptionsComponent {
  @Input()
  chart: common.ChartX;

  constructor(
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private navQuery: NavQuery
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.chart.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  async editChartInfo(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    let payloadGetMconfig: apiToBackend.ToBackendGetMconfigRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
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
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      chart: item,
      mconfig: mconfig
    });
  }

  deleteChart(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showDeleteChart({
      chart: item,
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd
    });
  }
}
