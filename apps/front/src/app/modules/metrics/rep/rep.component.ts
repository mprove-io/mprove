import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridReadyEvent,
  SelectionChangedEvent
} from 'ag-grid-community';
import { map, tap } from 'rxjs';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { TimeQuery } from '~front/app/queries/time.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { QueryService } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';
import { DataRendererComponent } from './data-renderer/data-renderer.component';
import { MetricRendererComponent } from './metric-renderer/metric-renderer.component';
import { StatusHeaderComponent } from './status-header/status-header.component';
import { StatusRendererComponent } from './status-renderer/status-renderer.component';

export interface RowData extends common.Row {
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

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      this.cd.detectChanges();
    })
  );

  columns: ColDef<RowData>[] = [
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
      // cellRendererParams: {
      //    color: 'guinnessBlack'
      // }
    }
  ];

  columnDefs: ColDef<RowData>[] = [
    ...this.columns
    // { field: 'jan2023', headerName: 'Jan 2023' },
  ];

  defaultColDef: ColDef<RowData> = {
    // sortable: true,
    // filter: true,
    suppressMovable: true,
    resizable: true,
    editable: false,
    suppressHeaderKeyboardEvent: params => true,
    suppressKeyboardEvent: params => true
  };

  rowData$ = this.repQuery.select().pipe(
    tap(x => {
      this.columnDefs = [
        ...this.columns,
        ...x.columns.map(column => {
          let columnDef: ColDef<RowData> = {
            field: `${column.columnId}`,
            headerName: column.label,
            cellRenderer: DataRendererComponent,
            type: 'numericColumn'
          };

          return columnDef;
        })
      ];
    }),
    map(x => {
      let metrics = this.metricsQuery.getValue();

      let data = x.rows.map((row: common.Row) => {
        // console.log(row);
        // console.log(metrics.metrics);

        let metric = metrics.metrics.find(m => m.metricId === row.metricId);

        let rowData: RowData = {
          rowId: row.rowId,
          parameters: '',
          metric: metric?.label || row.metricId,
          idx: row.rowId,
          query: row.query,
          metricId: row.metricId,
          mconfig: row.mconfig,
          hasAccessToModel: row.hasAccessToModel,
          formula: row.formula,
          params: row.params,
          records: row.records,
          rqs: row.rqs,
          currencyPrefix: metric?.currencyPrefix || row.currencyPrefix,
          currencySuffix: metric?.currencySuffix || row.currencySuffix,
          formatNumber: metric?.formatNumber || row.formatNumber
        };

        row.records.forEach(record => {
          rowData[record.key] = record.value;
        });

        return rowData;
      });

      return data;
    })
  );

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular<RowData>;

  constructor(
    private cd: ChangeDetectorRef,
    private repQuery: RepQuery,
    private timeQuery: TimeQuery,
    private queryService: QueryService,
    private uiQuery: UiQuery,
    private metricsQuery: MetricsQuery
  ) {}

  onSelectionChanged(event: SelectionChangedEvent) {
    let repSelectedNodes = event.api.getSelectedNodes();
    this.uiQuery.updatePart({ repSelectedNodes: repSelectedNodes });
    // console.log(selectedNodes);
  }

  onGridReady(params: GridReadyEvent<RowData>) {
    // this.agGrid.api.sizeColumnsToFit();
  }

  onCellClicked(e: CellClickedEvent<RowData>): void {
    // console.log('cellClicked', e);
  }

  rowDragEndHandle(e: any): void {
    console.log('rowDragEndHandle', e);
    // console.log(this.agGrid.api.getDisplayedRowAtIndex(0));
  }
}
