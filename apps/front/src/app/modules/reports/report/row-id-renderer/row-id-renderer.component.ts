import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ReportService } from '~front/app/services/report.service';

@Component({
  standalone: false,
  selector: 'm-row-id-renderer',
  templateUrl: './row-id-renderer.component.html'
})
export class RowIdRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  reportSelectedNodesLength: number;
  reportSelectedNode: IRowNode<DataRow>;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.reportSelectedNodesLength = x.reportSelectedNodes.length;

      this.reportSelectedNode =
        x.reportSelectedNodes.length === 1
          ? x.reportSelectedNodes[0]
          : undefined;
      this.cd.detectChanges();
    })
  );

  report: ReportX;
  report$ = this.reportQuery.select().pipe(
    tap(x => {
      this.report = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private reportService: ReportService,
    private reportQuery: ReportQuery
  ) {}

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    return true;
  }

  deleteRow() {
    this.uiQuery.getValue().gridApi.deselectAll();

    this.reportService.modifyRows({
      report: this.report,
      changeType: ChangeTypeEnum.Delete,
      rowChange: undefined,
      rowIds: [this.reportSelectedNode.data.rowId],
      reportFields: this.report.fields,
      chart: undefined
    });
  }

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }
}
