import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-renderer',
  templateUrl: './chart-renderer.component.html'
})
export class ChartRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeEmpty = common.RowTypeEnum.Empty;

  constructor(
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private mconfigService: MconfigService
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

    if (this.params.data.hasAccessToModel === true) {
      this.mconfigService.navDuplicateMconfigAndQuery({
        oldMconfigId: this.params.data.mconfig.mconfigId
      });
    }
  }
}
