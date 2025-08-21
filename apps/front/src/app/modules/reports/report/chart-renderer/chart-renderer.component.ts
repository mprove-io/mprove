import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DEFAULT_CHART_SERIES_LINE } from '~common/constants/mconfig-chart';
import { ChangeTypeEnum } from '~common/enums/change-type.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { makeCopy } from '~common/functions/make-copy';
import { MconfigChartSeries } from '~common/interfaces/blockml/mconfig-chart-series';
import { RowChange } from '~common/interfaces/blockml/row-change';
import { DataRow } from '~common/interfaces/front/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportService } from '~front/app/services/report.service';

@Component({
  standalone: false,
  selector: 'm-chart-renderer',
  templateUrl: './chart-renderer.component.html'
})
export class ChartRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeMetric = RowTypeEnum.Metric;
  rowTypeFormula = RowTypeEnum.Formula;
  rowTypeHeader = RowTypeEnum.Header;
  rowTypeEmpty = RowTypeEnum.Empty;

  constructor(
    private reportQuery: ReportQuery,
    private reportService: ReportService
  ) {}

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    return true;
  }

  toggleShowChart(event?: MouseEvent) {
    event.stopPropagation();

    this.params.api.deselectAll();
    setTimeout(() => {
      let newShowChart = !this.params.data.showChart;

      let report = this.reportQuery.getValue();

      let newChart = makeCopy(report.chart);

      if (newShowChart === true) {
        let newSeries: MconfigChartSeries = makeCopy(DEFAULT_CHART_SERIES_LINE);
        newSeries.dataRowId = this.params.data.rowId;
        newChart.series.push(newSeries);
      }
      // else {
      //   newChart.series = newChart.series.filter( // filtered on backend
      //     x => x.dataRowId !== this.params.data.rowId
      //   );
      // }

      let rowChange: RowChange = {
        rowId: this.params.data.rowId,
        formula: this.params.data.formula,
        parameters: this.params.data.parameters,
        metricId: this.params.data.metricId,
        showChart: newShowChart
      };

      this.reportService.modifyRows({
        report: report,
        changeType: ChangeTypeEnum.EditInfo,
        rowChange: rowChange,
        rowIds: undefined,
        reportFields: report.fields,
        chart: newChart
      });
    }, 0);
  }
}
