import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-row-id-renderer',
  templateUrl: './row-id-renderer.component.html'
})
export class RowIdRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  repSelectedNode: IRowNode<DataRow>;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.repSelectedNode =
        x.repSelectedNodes.length === 1 ? x.repSelectedNodes[0] : undefined;
      this.cd.detectChanges();
    })
  );

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private repService: RepService,
    private repQuery: RepQuery
  ) {}

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    return true;
  }

  clearRow() {
    this.repService.modifyRows({
      rep: this.rep,
      changeType: common.ChangeTypeEnum.Clear,
      rowChange: undefined,
      rowIds: [this.repSelectedNode.data.rowId]
    });
  }

  deleteRow() {
    this.uiQuery.getValue().gridApi.deselectAll();

    this.repService.modifyRows({
      rep: this.rep,
      changeType: common.ChangeTypeEnum.Delete,
      rowChange: undefined,
      rowIds: [this.repSelectedNode.data.rowId]
    });
  }
}
