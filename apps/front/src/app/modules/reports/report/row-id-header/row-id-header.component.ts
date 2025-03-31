import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ReportService } from '~front/app/services/report.service';
import { UiService } from '~front/app/services/ui.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-row-id-header',
  templateUrl: './row-id-header.component.html'
})
export class RowIdHeaderComponent implements IHeaderAngularComp {
  params: IHeaderParams;

  constructor(
    private uiQuery: UiQuery,
    private uiService: UiService,
    private reportService: ReportService,
    private reportQuery: ReportQuery,
    private cd: ChangeDetectorRef
  ) {}

  agInit(params: IHeaderParams) {
    this.params = params;
  }

  refresh(params: IHeaderParams) {
    this.params = params;
    return true;
  }

  addRow() {
    let reportSelectedNodes = this.uiQuery.getValue().reportSelectedNodes;

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId:
        reportSelectedNodes.length === 1
          ? reportSelectedNodes[0].data.rowId
          : undefined,
      rowType: common.RowTypeEnum.Empty,
      showChart: false
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.AddEmpty,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }
}
