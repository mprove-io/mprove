import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { map, tap } from 'rxjs';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { TimeQuery } from '~front/app/queries/time.query';
import { common } from '~front/barrels/common';
import { StatusHeaderComponent } from '../status-header/status-header.component';
import { StatusRendererComponent } from '../status-renderer/status-renderer.component';

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

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      this.cd.detectChanges();
    })
  );

  columns: ColDef[] = [
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
      width: 600
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

  columnDefs: ColDef[] = [
    ...this.columns
    // { field: 'jan2023', headerName: 'Jan 2023' },
  ];

  defaultColDef: ColDef = {
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
      let timeState = this.timeQuery.getValue();
      let timeSpec = timeState.timeSpec;

      this.columnDefs = [
        ...this.columns,
        ...x.columns.map(column => ({
          field: `${column.columnId}`,
          headerName: column.label
        }))
      ];
    }),
    map(x => {
      let metrics = this.metricsQuery.getValue();

      let data = x.rows.map((row: common.Row) => {
        // console.log(row);
        // console.log(metrics.metrics);

        let metric = metrics.metrics.find(m => m.metricId === row.metricId);

        let dataRow: any = {
          idx: row.rowId,
          parameters: '',
          metric: metric?.label || row.metricId,
          query: row.query
        };

        row.records.forEach(record => {
          dataRow[record.key] = record.value;
        });

        return dataRow;
      });

      return data;
    })
  );

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(
    private cd: ChangeDetectorRef,
    private repQuery: RepQuery,
    private timeQuery: TimeQuery,
    private metricsQuery: MetricsQuery
  ) {}

  onGridReady(params: GridReadyEvent) {
    // this.agGrid.api.sizeColumnsToFit();
  }

  onCellClicked(e: CellClickedEvent): void {
    // console.log('cellClicked', e);
  }

  rowDragEndHandle(e: any): void {
    // console.log('rowDragEndHandle', e);
    // console.log(this.agGrid.api.getDisplayedRowAtIndex(0));
  }
}
