import { ChangeDetectorRef, Component } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { RepService } from '~front/app/services/rep.service';
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
    private repService: RepService,
    private repQuery: RepQuery,
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
    let repSelectedNodes = this.uiQuery.getValue().repSelectedNodes;

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId:
        repSelectedNodes.length === 1
          ? repSelectedNodes[0].data.rowId
          : undefined,
      rowType: common.RowTypeEnum.Empty,
      showChart: false
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.AddEmpty,
      rowChange: rowChange,
      rowIds: undefined
    });
  }
}
