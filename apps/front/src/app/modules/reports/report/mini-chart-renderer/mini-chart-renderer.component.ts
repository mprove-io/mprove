import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { EChartsInitOpts, EChartsOption } from 'echarts';
import type { RowType } from '#common/types/blockml/parts/report/row/row-type';
import type { DataRow } from '#common/types/front/report/row/data-row';
import { UiQuery } from '#front/app/queries/ui.query';
import { DataService } from '#front/app/services/data.service';

const valueRowTypes = ['metric', 'formula'] satisfies RowType[];

@Component({
  standalone: false,
  selector: 'm-mini-chart-renderer',
  templateUrl: './mini-chart-renderer.component.html'
})
export class MiniChartRendererComponent implements ICellRendererAngularComp {
  readonly valueRowTypes: RowType[] = valueRowTypes;

  params: ICellRendererParams<DataRow>;

  localInitOpts: any;
  localOptions: EChartsOption;

  constructor(
    private uiQuery: UiQuery,
    private dataService: DataService
  ) {}

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;
    this.updateChartData();
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    this.updateChartData();
    return true;
  }

  updateChartData() {
    if (
      valueRowTypes.some(candidate => candidate === this.params.data.rowType)
    ) {
      let chartPointsData = this.uiQuery.getValue().chartPointsData;

      this.localInitOpts = {
        renderer: 'svg'
      } as EChartsInitOpts;

      this.localOptions = {
        animation: false,
        useUTC: true,
        grid: {
          left: 0,
          right: 0,
          top: 7,
          bottom: 7
        },
        textStyle: {
          fontFamily: 'sans-serif'
        },
        legend: { show: false },
        tooltip: { show: false },
        xAxis: {
          type: 'time',
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false }
        },
        yAxis: { show: false },
        series: this.dataService.metricsRowToSeries({
          isMiniChart: true,
          row: this.params.data,
          dataPoints: chartPointsData.dataPoints,
          chartSeriesElement: undefined,
          showMetricsModelName: this.uiQuery.getValue().showMetricsModelName,
          showMetricsTimeFieldName:
            this.uiQuery.getValue().showMetricsTimeFieldName
        })
      };
    }
  }

  onChartInit(ec: any) {
    ec.getZr().on('mousemove', function (params: any) {
      ec.getZr().setCursorStyle('default');
    });
  }
}
