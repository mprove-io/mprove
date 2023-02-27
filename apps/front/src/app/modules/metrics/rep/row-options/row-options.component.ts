import { Component, Input } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { RepQuery } from '~front/app/queries/rep.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-row-options',
  templateUrl: './row-options.component.html'
})
export class RowOptionsComponent {
  @Input()
  params: ICellRendererParams<DataRow>;

  constructor(
    private repService: RepService,
    private repQuery: RepQuery,
    private mconfigService: MconfigService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();

    console.log(this.params.data);

    let gridApi = this.params.api;

    gridApi.deselectAll();

    this.params.node.setSelected(true);
  }

  deleteRow(event: MouseEvent) {
    event.stopPropagation();

    let selectedRep = this.repQuery.getValue();

    this.params.api.deselectAll();

    let rowChange: common.RowChange = {
      rowId: this.params.data.rowId
    };

    this.repService.changeRows({
      rep: selectedRep,
      changeType: common.ChangeTypeEnum.Delete,
      rowChanges: [rowChange]
    });
  }

  clearRow(event: MouseEvent) {
    event.stopPropagation();

    let selectedRep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.params.data.rowId
    };

    this.repService.changeRows({
      rep: selectedRep,
      changeType: common.ChangeTypeEnum.Clear,
      rowChanges: [rowChange]
    });
  }

  explore(event: MouseEvent) {
    event.stopPropagation();

    let mconfig = this.params.data.mconfig;

    if (this.params.data.hasAccessToModel === true) {
      this.mconfigService.navDuplicateMconfigAndQuery({
        oldMconfigId: mconfig.mconfigId
      });
    }
  }
}
