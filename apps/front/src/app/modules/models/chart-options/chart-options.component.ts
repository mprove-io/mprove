import { Component, Input } from '@angular/core';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-chart-options',
  templateUrl: './chart-options.component.html'
})
export class ChartOptionsComponent {
  @Input()
  chart: ChartX;

  @Input()
  isHoverM: boolean;

  constructor(
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private uiQuery: UiQuery
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.chart.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  async editChartInfo(event: MouseEvent, item: ChartX) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();

    this.myDialogService.showEditChartInfo({
      apiService: this.apiService,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      chart: item
    });
  }

  deleteChart(event: MouseEvent, item: ChartX) {
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
