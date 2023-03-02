import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IRowNode,
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
import { ChartHeaderComponent } from './chart-header/chart-header.component';
import { ChartRendererComponent } from './chart-renderer/chart-renderer.component';
import { DataRendererComponent } from './data-renderer/data-renderer.component';
import { MetricHeaderComponent } from './metric-header/metric-header.component';
import { MetricRendererComponent } from './metric-renderer/metric-renderer.component';
import { RowIdHeaderComponent } from './row-id-header/row-id-header.component';
import { RowIdRendererComponent } from './row-id-renderer/row-id-renderer.component';
import { StatusHeaderComponent } from './status-header/status-header.component';
import { StatusRendererComponent } from './status-renderer/status-renderer.component';

export interface DataRow extends common.Row {
  parameters: string;
  // [col: string]: any;
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
      field: 'rowId',
      rowDrag: true,
      resizable: false,
      pinned: 'left',
      width: 90,
      minWidth: 90,
      maxWidth: 90,
      headerComponent: RowIdHeaderComponent,
      cellRenderer: RowIdRendererComponent
    },
    {
      field: 'name',
      pinned: 'left',
      width: 500,
      headerComponent: MetricHeaderComponent,
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
      width: 84,
      headerComponent: StatusHeaderComponent,
      cellRenderer: StatusRendererComponent
    },
    {
      field: 'chart',
      pinned: 'left',
      resizable: false,
      width: 60,
      headerComponent: ChartHeaderComponent,
      cellRenderer: ChartRendererComponent
    }
  ];

  columnTypes = {
    running: {}
  };

  columnDefs: ColDef<DataRow>[] = [...this.columns];
  timeColumns: ColDef<DataRow>[] = [];

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

      this.timeColumns = x.columns.map(column => {
        let columnDef: ColDef<DataRow> = {
          field: `${column.columnId}`,
          headerName: column.label,
          cellRenderer: DataRendererComponent,
          type: 'numericColumn'
        };

        return columnDef;
      });

      let runningQueriesLength = this.rep.rows
        .filter(row => common.isDefined(row.query))
        .map(row => row.query.status)
        .filter(status => status === common.QueryStatusEnum.Running).length;

      let statusColumn = this.columns.find(c => c.field === 'status');

      statusColumn.type = runningQueriesLength > 0 ? 'running' : undefined;

      this.columnDefs = [...this.columns, ...this.timeColumns];

      // let metrics = this.metricsQuery.getValue();

      this.data = x.rows.map((row: common.Row) => {
        // let metric = metrics.metrics.find(m => m.metricId === row.metricId);

        let dataRow: DataRow = Object.assign({}, row, {
          parameters: common.isDefined(row.params)
            ? JSON.stringify(row.params)
            : ''
        });

        row.records
          .filter(record => record.key !== 0)
          .forEach(record => {
            (dataRow as any)[record.key] = record.value;
            let column = x.columns.find(c => c.columnId === record.key);
            record.columnLabel = column.label;
          });

        return dataRow;
      });

      let sNodes = this.uiQuery.getValue().repSelectedNodes;

      this.updateRepChartData(sNodes);

      if (
        common.isDefined(this.prevRepId) &&
        this.rep.repId === this.prevRepId
      ) {
        if (common.isDefined(this.agGridApi)) {
          this.uiQuery.getValue().repSelectedNodes.forEach(node => {
            let rowNode = this.agGridApi.getRowNode(node.id);
            if (common.isDefined(rowNode)) {
              rowNode.setSelected(true);
            }
          });
        }
      }

      this.prevRepId = this.rep.repId;

      this.cd.detectChanges();
    })
  );

  queryParams$ = this.route.queryParams.pipe(
    tap(queryParams => {
      // console.log('queryParams tap');

      let selectNodes = queryParams['selectNodes'];
      // console.log('selectNodes', selectNodes);

      let nodeIds: string[] = common.isDefined(selectNodes)
        ? selectNodes.split('-')
        : [];

      setTimeout(() => {
        // console.log('this.agGridApi', this.agGridApi);
        if (common.isDefined(this.agGridApi)) {
          if (nodeIds.length > 0) {
            nodeIds.forEach(nodeId => {
              let rowNode = this.agGridApi.getRowNode(nodeId);
              if (common.isDefined(rowNode)) {
                rowNode.setSelected(true);
              }
            });
          } else {
            this.agGridApi.deselectAll();
          }
          this.cd.detectChanges();
        }
      }, 1);
    })
  );

  @ViewChild(AgGridAngular) agGrid: AgGridAngular<DataRow>;

  constructor(
    private cd: ChangeDetectorRef,
    private repQuery: RepQuery,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private repService: RepService,
    private uiQuery: UiQuery,
    private metricsQuery: MetricsQuery
  ) {}

  onSelectionChanged(event: SelectionChangedEvent<DataRow>) {
    let sNodes = event.api.getSelectedNodes();
    this.updateRepChartData(sNodes);

    let nodeIds = sNodes.map(node => node.id);
    // console.log('onSelectionChanged', nodeIds);

    const url = this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: {
          draft: this.rep.draft === true ? common.DraftEnum.Yes : undefined,
          selectNodes: nodeIds.length > 0 ? nodeIds.join('-') : undefined
        }
      })
      .toString();

    this.location.go(url);
  }

  updateRepChartData(sNodes: IRowNode<DataRow>[]) {
    let showChartForSelectedRow =
      this.uiQuery.getValue().showChartForSelectedRow;

    this.uiQuery.updatePart({
      repSelectedNodes: sNodes,
      gridData: this.data,
      repChartData: {
        rows:
          showChartForSelectedRow === true && sNodes.length === 1
            ? this.data.filter(
                row =>
                  sNodes.map(node => node.data.rowId).indexOf(row.rowId) > -1
              )
            : showChartForSelectedRow === true && sNodes.length > 1
            ? []
            : this.data.filter(row => row.showChart === true),
        columns: this.rep.columns
      }
    });
  }

  onRangeSelectionChanged(event: RangeSelectionChangedEvent<DataRow>) {
    // console.log('onRangeSelectionChanged');
  }

  onGridReady(params: GridReadyEvent<DataRow>) {
    this.agGridApi = this.agGrid.api;
    this.uiQuery.updatePart({ gridApi: this.agGridApi });
    this.agGridApi.deselectAll();
    this.cd.detectChanges();
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

    this.repService.changeRows({
      rep: selectedRep,
      changeType: common.ChangeTypeEnum.Move,
      rowChanges: rowChanges
    });
  }
}
