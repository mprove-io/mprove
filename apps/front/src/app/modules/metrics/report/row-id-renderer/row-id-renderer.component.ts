import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';

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

  rep: common.ReportX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private repService: ReportService,
    private repQuery: ReportQuery
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
