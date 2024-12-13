import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { ApiService } from '~front/app/services/api.service';
import { DataService } from '~front/app/services/data.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-renderer',
  templateUrl: './chart-renderer.component.html'
})
export class ChartRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeEmpty = common.RowTypeEnum.Empty;

  constructor(
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private mconfigService: MconfigService,
    private dataService: DataService,
    private apiService: ApiService,
    private myDialogService: MyDialogService
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
      let report = this.reportQuery.getValue();

      let rowChange: common.RowChange = {
        rowId: this.params.data.rowId,
        formula: this.params.data.formula,
        parameters: this.params.data.parameters,
        metricId: this.params.data.metricId,
        showChart: !this.params.data.showChart
      };

      this.reportService.modifyRows({
        report: report,
        changeType: common.ChangeTypeEnum.EditInfo,
        rowChange: rowChange,
        rowIds: undefined
      });
    }, 0);
  }

  explore(event?: MouseEvent) {
    event.stopPropagation();

    let qData =
      this.params.data.mconfig.queryId === this.params.data.query.queryId
        ? this.dataService.makeQData({
            data: this.params.data.query.data,
            columns: this.params.data.mconfig.fields
          })
        : [];

    let checkSelectResult = getSelectValid({
      chart: this.params.data.mconfig.chart,
      mconfigFields: this.params.data.mconfig.fields
    });

    let isSelectValid = checkSelectResult.isSelectValid;
    // let errorMessage = checkSelectResult.errorMessage;

    this.myDialogService.showChart({
      apiService: this.apiService,
      mconfig: this.params.data.mconfig,
      query: this.params.data.query,
      qData: qData,
      canAccessModel: this.params.data.hasAccessToModel,
      showNav: true,
      isSelectValid: isSelectValid,
      dashboardId: undefined,
      chartId: undefined
    });
  }
}
