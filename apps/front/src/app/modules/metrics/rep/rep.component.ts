import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { Observable, of, tap } from 'rxjs';
import { RepQuery } from '~front/app/queries/rep.query';
import { common } from '~front/barrels/common';
import { exampleData } from './example-data';

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
      pinned: 'left',
      width: 90,
      minWidth: 90,
      maxWidth: 90
    },
    { field: 'parameters', pinned: 'left', width: 400 },
    { field: 'metric', pinned: 'left', width: 400 },
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

  constructor(private cd: ChangeDetectorRef, private repQuery: RepQuery) {}

  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    this.rowData$ = of(exampleData);
  }

  // Example of consuming Grid Event
  onCellClicked(e: CellClickedEvent): void {
    console.log('cellClicked', e);
  }

  // Example using Grid's API
  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }
}
