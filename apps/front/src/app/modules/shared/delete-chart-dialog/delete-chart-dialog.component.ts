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
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { Chart } from '~common/interfaces/blockml/chart';
import {
  ToBackendDeleteChartRequestPayload,
  ToBackendDeleteChartResponse
} from '~common/interfaces/to-backend/charts/to-backend-delete-chart';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

export interface DeleteChartDialogData {
  apiService: ApiService;
  chart: Chart;
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

    let chart: Chart = this.ref.data.chart;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendDeleteChartRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      chartId: chart.chartId
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteChart,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteChartResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
