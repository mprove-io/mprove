import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { EChartsOption } from 'echarts';
import { DataRow } from '~front/app/interfaces/data-row';
import { UiQuery } from '~front/app/queries/ui.query';
import { DataService } from '~front/app/services/data.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-mini-chart-renderer',
  templateUrl: './mini-chart-renderer.component.html'
})
export class MiniChartRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeFormula = common.RowTypeEnum.Formula;
  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeEmpty = common.RowTypeEnum.Empty;

  eChartInitOpts: any;
  eChartOptions: EChartsOption;

  constructor(private uiQuery: UiQuery, private dataService: DataService) {}

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;

    if (
      [common.RowTypeEnum.Metric, common.RowTypeEnum.Formula].indexOf(
        this.params.data.rowType
      ) > -1
    ) {
      let chartFormulaData = this.uiQuery.getValue().chartFormulaData;

      this.eChartInitOpts = chartFormulaData.eChartInitOpts;
      this.eChartOptions = Object.assign({}, chartFormulaData.eChartOptions, {
        tooltip: { show: false },
        legend: { show: false },
        xAxis: Object.assign({}, chartFormulaData.eChartOptions.xAxis, {
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false }
        }),
        yAxis: { show: false },
        grid: {
          left: 0,
          right: 0,
          top: 10,
          bottom: 10
        },
        series: this.dataService.metricsRowToSeries({
          row: this.params.data,
          chartSeriesElement: undefined,
          isMiniChart: true,
          showMetricsModelName: this.uiQuery.getValue().showMetricsModelName,
          showMetricsTimeFieldName:
            this.uiQuery.getValue().showMetricsTimeFieldName,
          dataPoints: chartFormulaData.dataPoints
        })
      });
    }
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    return true;
  }
}
