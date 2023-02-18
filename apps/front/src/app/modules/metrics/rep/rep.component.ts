import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RangeSelectionChangedEvent,
  RowDragEndEvent,
  SelectionChangedEvent
} from 'ag-grid-community';
import { tap } from 'rxjs';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';
import { DataRendererComponent } from './data-renderer/data-renderer.component';
import { MetricRendererComponent } from './metric-renderer/metric-renderer.component';
import { StatusHeaderComponent } from './status-header/status-header.component';
import { StatusRendererComponent } from './status-renderer/status-renderer.component';

export interface DataRow extends common.Row {
  idx: string;
  metric: string;
  parameters: string;
  [record: string]: any;
}

@Component({
  selector: 'm-rep',
  styleUrls: ['rep.component.scss'],
  templateUrl: './rep.component.html'
})
export class RepComponent {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.agGrid.api.deselectAll();
  }

  rowCssClasses = ['group'];

  data: DataRow[];

  columns: ColDef<DataRow>[] = [
    {
      field: 'idx',
      rowDrag: true,
      resizable: false,
      pinned: 'left',
      width: 90,
      minWidth: 90,
      maxWidth: 90
    },
    {
      field: 'metric',
      pinned: 'left',
      width: 600,
      cellRenderer: MetricRendererComponent
    },
    {
      field: 'parameters',
      pinned: 'left',
      width: 200
    },
    {
      field: 'status',
      pinned: 'left',
      resizable: false,
      width: 80,
      cellRenderer: StatusRendererComponent,
      headerComponent: StatusHeaderComponent
    }
  ];

  columnDefs: ColDef<DataRow>[] = [...this.columns];

  defaultColDef: ColDef<DataRow> = {
    suppressMovable: true,
    resizable: true,
    editable: false,
    suppressHeaderKeyboardEvent: params => true,
    suppressKeyboardEvent: params => true
  };

  agGridApi: GridApi<DataRow>;
  prevRepId: string;

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;

      if (common.isDefined(this.agGridApi)) {
        if (
          common.isDefined(this.prevRepId) &&
          this.rep.repId !== this.prevRepId
        ) {
          this.agGridApi.deselectAll();
        } else {
          setTimeout(() => {
            this.uiQuery.getValue().repSelectedNodes.forEach(node => {
              let rowNode = this.agGridApi.getRowNode(node.id);
              if (common.isDefined(rowNode)) {
                rowNode.setSelected(true);
              }
              this.cd.detectChanges();
            });
          }, 0);
        }
      }

      this.prevRepId = this.rep.repId;

      this.columnDefs = [
        ...this.columns,
        ...x.columns.map(column => {
          let columnDef: ColDef<DataRow> = {
            field: `${column.columnId}`,
            headerName: column.label,
            cellRenderer: DataRendererComponent,
            type: 'numericColumn'
          };

          return columnDef;
        })
      ];

      let metrics = this.metricsQuery.getValue();

      this.data = x.rows.map((row: common.Row) => {
        let metric = metrics.metrics.find(m => m.metricId === row.metricId);

        let dataRow: DataRow = {
          rowId: row.rowId,
          parameters: '',
          metric: metric?.label || row.metricId,
          idx: row.rowId,
          query: row.query,
          metricId: row.metricId,
          mconfig: row.mconfig,
          hasAccessToModel: row.hasAccessToModel,
          formula: row.formula,
          formula_deps: row.formula_deps,
          params: row.params,
          records: row.records,
          rqs: row.rqs,
          currencyPrefix: metric?.currencyPrefix || row.currencyPrefix,
          currencySuffix: metric?.currencySuffix || row.currencySuffix,
          formatNumber: metric?.formatNumber || row.formatNumber
        };

        row.records.forEach(record => {
          dataRow[record.key] = record.value;
        });

        return dataRow;
      });

      this.cd.detectChanges();
    })
  );

  @ViewChild(AgGridAngular) agGrid: AgGridAngular<DataRow>;

  constructor(
    private cd: ChangeDetectorRef,
    private repQuery: RepQuery,
    private repService: RepService,
    private uiQuery: UiQuery,
    private metricsQuery: MetricsQuery
  ) {}

  onSelectionChanged(event: SelectionChangedEvent<DataRow>) {
    let repSelectedNodes = event.api.getSelectedNodes();
    this.uiQuery.updatePart({ repSelectedNodes: repSelectedNodes });
    console.log('onSelectionChanged', repSelectedNodes);
  }

  onRangeSelectionChanged(event: RangeSelectionChangedEvent<DataRow>) {
    console.log('onRangeSelectionChanged');
  }

  onGridReady(params: GridReadyEvent<DataRow>) {
    this.agGridApi = this.agGrid.api;
    this.agGridApi.deselectAll();
  }

  rowDragEndHandle(event: RowDragEndEvent<DataRow>): void {
    let gridApi = event.api;

    let rowIds = [];
    let displayedRowsCount = gridApi.getDisplayedRowCount();
    for (let i = 0; i < displayedRowsCount; i++) {
      let rowNode = gridApi.getDisplayedRowAtIndex(i);
      rowIds.push(rowNode.data.rowId);
    }

    let rowChanges: common.RowChange[] = rowIds.map(rowId => {
      let rowChange: common.RowChange = {
        rowId: rowId
      };
      return rowChange;
    });

    let selectedRep = this.repQuery.getValue();

    this.agGridApi.deselectAll();

    if (selectedRep.draft === true) {
      this.repService.editDraftRep({
        repId: selectedRep.repId,
        rowChanges: rowChanges,
        changeType: common.ChangeTypeEnum.Move
      });
    } else {
      this.repService.navCreateDraftRep({
        fromRepId: selectedRep.repId,
        fromDraft: selectedRep.draft,
        rowChanges: rowChanges,
        changeType: common.ChangeTypeEnum.Move
      });
    }
  }
}
