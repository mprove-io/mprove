import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { Observable, of, tap } from 'rxjs';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-rep',
  styleUrls: ['rep.component.scss'],
  templateUrl: './rep.component.html'
})
export class RepComponent {
  rep: common.Rep;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      this.cd.detectChanges();
    })
  );

  // Each Column Definition results in one Column.
  columnDefs: ColDef[] = [
    {
      field: 'idx',
      rowDrag: true,
      editable: false,
      resizable: false,
      pinned: 'left',
      width: 90,
      minWidth: 90,
      maxWidth: 90
    },
    { field: 'metric', suppressMovable: false, pinned: 'left', width: 400 },
    { field: 'parameters', suppressMovable: false, pinned: 'left', width: 400 },
    { field: 'jan2023', headerName: 'Jan 2023' },
    { field: 'feb2023' },
    { field: 'mar2023' },
    { field: 'apr2023' }
  ];

  // DefaultColDef sets props common to all Columns
  defaultColDef: ColDef = {
    // sortable: true,
    // filter: true,
    suppressMovable: true,
    resizable: true,
    editable: true
  };

  // Data that gets displayed in the grid
  rowData$!: Observable<any[]>;

  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(
    private cd: ChangeDetectorRef,
    private repQuery: RepQuery,
    private metricsQuery: MetricsQuery
  ) {}

  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    let metrics = this.metricsQuery.getValue();
    let rep = this.repQuery.getValue();

    let data = rep.rows.map(row => {
      console.log(row);
      console.log(metrics.metrics);

      let metric = metrics.metrics.find(m => m.metricId === row.metricId);

      let dataRow = {
        idx: 'A',
        parameters: '',
        metric: metric.label,
        jan2023: 72000,
        feb2023: 72000,
        mar2023: 72000,
        apr2023: 72000
      };
      return dataRow;
    });

    this.rowData$ = of(data);
  }

  // Example of consuming Grid Event
  onCellClicked(e: CellClickedEvent): void {
    console.log('cellClicked', e);
  }

  rowDragEndHandle(e: any): void {
    console.log('rowDragEndHandle', e);
    console.log(this.agGrid.api.getDisplayedRowAtIndex(0));
  }

  // Example using Grid's API
  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }
}
