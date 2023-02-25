import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { RepQuery } from '~front/app/queries/rep.query';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-chart-renderer',
  templateUrl: './chart-renderer.component.html'
})
export class ChartRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  constructor(private repQuery: RepQuery, private repService: RepService) {}

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

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.params.data.rowId,
      formula: this.params.data.formula,
      params: this.params.data.params,
      metricId: this.params.data.metricId,
      showChart: !this.params.data.showChart
    };

    if (rep.draft === true) {
      this.repService.editDraftRep({
        repId: rep.repId,
        changeType: common.ChangeTypeEnum.EditInfo,
        rowChanges: [rowChange]
      });
    } else {
      this.repService.navCreateDraftRep({
        fromRepId: rep.repId,
        fromDraft: rep.draft,
        rowChanges: [rowChange],
        changeType: common.ChangeTypeEnum.EditInfo
      });
    }
  }
}
