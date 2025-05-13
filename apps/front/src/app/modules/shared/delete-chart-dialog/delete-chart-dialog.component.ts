import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface DeleteChartDialogData {
  apiService: ApiService;
  chart: common.Chart;
  projectId: string;
  branchId: string;
  envId: string;
  isRepoProd: boolean;
}

@Component({
  selector: 'm-delete-chart-dialog',
  templateUrl: './delete-chart-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteChartDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteChartDialogData>,
    private navigateService: NavigateService,
    private chartsQuery: ChartsQuery,
    private chartQuery: ChartQuery,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let { projectId, branchId, isRepoProd } = this.ref.data;

    let chart: common.Chart = this.ref.data.chart;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendDeleteChartRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      chartId: chart.chartId
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteChart,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteChartResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let charts = this.chartsQuery.getValue().charts;

            this.chartsQuery.update({
              charts: charts.filter(d => d.chartId !== chart.chartId)
            });

            let currentChart = this.chartQuery.getValue();

            if (currentChart.chartId === chart.chartId) {
              this.navigateService.navigateToCharts();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
