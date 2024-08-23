import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  ColumnResizedEvent,
  GridApi,
  GridReadyEvent,
  IRowNode,
  RangeSelectionChangedEvent,
  RowDragEndEvent,
  RowHeightParams,
  SelectionChangedEvent
} from 'ag-grid-community';
import { combineLatest, tap } from 'rxjs';
import { debounce } from 'throttle-debounce';
import { makeRepQueryParams } from '~front/app/functions/make-query-params';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { RepService } from '~front/app/services/rep.service';
import { UiService } from '~front/app/services/ui.service';
import { common } from '~front/barrels/common';
import { ChartHeaderComponent } from './chart-header/chart-header.component';
import { ChartRendererComponent } from './chart-renderer/chart-renderer.component';
import { DataRendererComponent } from './data-renderer/data-renderer.component';
import { MetricHeaderComponent } from './metric-header/metric-header.component';
import { MetricRendererComponent } from './metric-renderer/metric-renderer.component';
import { ParametersHeaderComponent } from './parameters-header/parameters-header.component';
import { ParametersRendererComponent } from './parameters-renderer/parameters-renderer.component';
import { RowIdHeaderComponent } from './row-id-header/row-id-header.component';
import { RowIdRendererComponent } from './row-id-renderer/row-id-renderer.component';
import { StatusHeaderComponent } from './status-header/status-header.component';
import { StatusRendererComponent } from './status-renderer/status-renderer.component';

export interface DataRow extends common.Row {
  showParametersJson: boolean;
  isRepParametersHaveError: boolean;
  strParameters: string;
  finalRowHeight: number;
  // [col: string]: any;
}

@Component({
  selector: 'm-rep',
  styleUrls: ['rep.component.scss'],
  templateUrl: './rep.component.html'
})
export class RepComponent {
  // @HostListener('window:keyup.esc')
  // onEscKeyUp() {
  //   this.agGrid.api.deselectAll();
  // }

  updateColumnSizes = debounce(
    300,
    paramsColumn => {
      if (common.isDefined(this.agGridApi)) {
        let columns = this.agGridApi.getColumns();

        let nameColumn = columns.find(x => x.getColId() === 'name');
        let parametersColumn = columns.find(x => x.getColId() === 'parameters');

        let uiState = this.uiQuery.getValue();

        this.uiQuery.updatePart({
          metricsColumnNameWidth: nameColumn.getActualWidth(),
          metricsColumnParametersWidth: parametersColumn.getActualWidth(),
          metricsTimeColumnsNarrowWidth:
            ['name', 'parameters'].indexOf(paramsColumn.colId) > -1
              ? uiState.metricsTimeColumnsNarrowWidth
              : [
                  common.TimeSpecEnum.Hours,
                  common.TimeSpecEnum.Minutes
                ].indexOf(uiState.timeSpec) > -1
              ? uiState.metricsTimeColumnsNarrowWidth
              : paramsColumn.getActualWidth(),
          metricsTimeColumnsWideWidth:
            ['name', 'parameters'].indexOf(paramsColumn.colId) > -1
              ? uiState.metricsTimeColumnsWideWidth
              : [
                  common.TimeSpecEnum.Hours,
                  common.TimeSpecEnum.Minutes
                ].indexOf(uiState.timeSpec) > -1
              ? paramsColumn.getActualWidth()
              : uiState.metricsTimeColumnsWideWidth
        });

        uiState = this.uiQuery.getValue();

        this.uiService.setUserUi({
          metricsColumnNameWidth: uiState.metricsColumnNameWidth,
          metricsColumnParametersWidth: uiState.metricsColumnParametersWidth,
          metricsTimeColumnsNarrowWidth: uiState.metricsTimeColumnsNarrowWidth,
          metricsTimeColumnsWideWidth: uiState.metricsTimeColumnsWideWidth
        });
      }
    },
    { atBegin: false }
  );

  rowCssClasses = ['group'];

  data: DataRow[];

  columns: ColDef<DataRow>[] = [
    {
      field: 'rowId',
      rowDrag: true,
      resizable: false,
      pinned: 'left',
      width: 90,
      headerComponent: RowIdHeaderComponent,
      cellRenderer: RowIdRendererComponent
      // ,
      // cellStyle: { backgroundColor: '#f8f8f8' }
    },
    {
      field: 'name',
      pinned: 'left',
      minWidth: 314,
      headerComponent: MetricHeaderComponent,
      cellRenderer: MetricRendererComponent
    },
    {
      field: 'parameters',
      pinned: 'left',
      minWidth: 60,
      headerComponent: ParametersHeaderComponent,
      cellRenderer: ParametersRendererComponent
    },
    {
      field: 'status' as any,
      pinned: 'right',
      resizable: false,
      width: 84,
      headerComponent: StatusHeaderComponent,
      cellRenderer: StatusRendererComponent
    },
    {
      field: 'chart' as any,
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

  // prevRepId: string;

  // repSelectedRowIdsDistinct$ = this.uiQuery.repSelectedRowIdsDistinct$.pipe(
  //   tap(x => {
  //     if (common.isDefined(this.agGridApi)) {
  //       let rowIdColDef = this.agGridApi.getColumn('rowId').getColDef();

  //       let newColDef = Object.assign({}, rowIdColDef, {
  //         cellStyle: (params: CellClassParams<any, any>) => x.indexOf(params.data.rowId) > -1
  //             ? { backgroundColor: 'rgb(255, 224, 129)' }
  //             : { backgroundColor: '#f8f8f8' }
  //       });

  //       this.agGridApi
  //         .getColumn('rowId')
  //         .setColDef(newColDef, { field: 'rowId' });
  //     }
  //   })
  // );

  rep: common.RepX;
  rep$ = combineLatest([
    this.repQuery.select(),
    this.uiQuery.timeColumnsNarrowWidth$,
    this.uiQuery.timeColumnsWideWidth$,
    this.uiQuery.showChartForSelectedRows$,
    this.uiQuery.showParametersJson$
  ]).pipe(
    tap(
      ([
        rep,
        timeColumnsNarrowWidth,
        timeColumnsWideWidth,
        showChartForSelectedRows,
        showParametersJson
      ]: [common.RepX, number, number, boolean, boolean]) => {
        this.rep = rep;

        let uiState = this.uiQuery.getValue();

        let nameColumn = this.columns.find(c => c.field === 'name');
        let parametersColumn = this.columns.find(c => c.field === 'parameters');

        nameColumn.width = uiState.metricsColumnNameWidth;

        parametersColumn.width = uiState.metricsColumnParametersWidth;

        this.timeColumns = this.rep.columns.map(column => {
          let columnDef: ColDef<DataRow> = {
            field: `${column.columnId}` as any,
            headerName: column.label,
            cellRenderer: DataRendererComponent,
            type: 'numericColumn',
            width:
              [common.TimeSpecEnum.Minutes, common.TimeSpecEnum.Hours].indexOf(
                uiState.timeSpec
              ) > -1
                ? Math.max(220, timeColumnsWideWidth)
                : Math.max(155, timeColumnsNarrowWidth),
            minWidth:
              [common.TimeSpecEnum.Minutes, common.TimeSpecEnum.Hours].indexOf(
                uiState.timeSpec
              ) > -1
                ? 220
                : 155,
            maxWidth: 300,
            resizable: true
          };

          return columnDef;
        });

        let runningQueriesLength = this.rep.rows
          .filter(row => common.isDefined(row.query))
          .map(row => row.query.status)
          .filter(status => status === common.QueryStatusEnum.Running).length;

        let statusColumn = this.columns.find(
          c => c.field === ('status' as any)
        );

        statusColumn.type = runningQueriesLength > 0 ? 'running' : undefined;

        this.columnDefs = [...this.columns, ...this.timeColumns];

        // let metrics = this.metricsQuery.getValue();

        let isRepParametersHaveError =
          this.rep.rows.filter(
            row =>
              row.isParamsJsonValid === false ||
              row.isParamsSchemaValid === false
          ).length > 0;

        this.data = this.rep.rows.map((row: common.Row) => {
          // let metric = metrics.metrics.find(m => m.metricId === row.metricId);

          let dataRow: DataRow = Object.assign({}, row, <DataRow>{
            showParametersJson: showParametersJson,
            isRepParametersHaveError: isRepParametersHaveError,
            strParameters: common.isDefined(row.parameters)
              ? JSON.stringify(row.parameters)
              : ''
          });

          console.log(row.rowId);
          console.log(row.records);

          row.records.forEach(record => {
            (dataRow as any)[record.key] = record.value;

            let column = this.rep.columns.find(c => c.columnId === record.key);

            // if (common.isUndefined(column)) {
            //   console.log(record.key);
            // }

            record.columnLabel = column.label;
          });

          return dataRow;
        });

        let sNodes = this.uiQuery.getValue().repSelectedNodes;

        this.updateRepChartData(sNodes);

        // console.log('rep$ combined - tap');

        // if (
        //   common.isDefined(this.prevRepId) &&
        //   this.rep.repId === this.prevRepId
        //   ) {
        // console.log('rep$ combined - prev repId is the same');
        if (common.isDefined(this.agGridApi)) {
          this.uiQuery.getValue().repSelectedNodes.forEach(node => {
            let rowNode = this.agGridApi.getRowNode(node.id);
            if (common.isDefined(rowNode)) {
              // console.log('rep$ combined - set select node');
              rowNode.setSelected(true);
            }
          });
        }
        // }

        // this.prevRepId = this.rep.repId;

        this.cd.detectChanges();
      }
    )
  );

  queryParams$ = this.route.queryParams.pipe(
    tap(queryParams => {
      // console.log('queryParams - tap')

      let selectRows = queryParams['selectRows'];

      let nodeIds: string[] = common.isDefined(selectRows)
        ? selectRows.split('-')
        : [];

      setTimeout(() => {
        if (common.isUndefined(this.agGridApi)) {
          return;
        }
        if (nodeIds.length > 0) {
          nodeIds.forEach(nodeId => {
            let rowNode = this.agGridApi.getRowNode(nodeId);
            if (common.isDefined(rowNode)) {
              // console.log('queryParams - set select node')
              rowNode.setSelected(true);
            }
          });
        } else {
          // console.log('queryParams - deselect', nodeIds);
          this.agGridApi.deselectAll();
        }
        this.cd.detectChanges();
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
    private uiService: UiService
  ) {}

  onSelectionChanged(event: SelectionChangedEvent<DataRow>) {
    let sNodes = event.api.getSelectedNodes();
    this.updateRepChartData(sNodes);

    let nodeIds = sNodes.map(node => node.id);
    // console.log('onSelectionChanged', nodeIds);

    let uiState = this.uiQuery.getValue();

    const url = this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: makeRepQueryParams({
          timezone: uiState.timezone,
          timeSpec: uiState.timeSpec,
          timeRangeFraction: uiState.timeRangeFraction,
          selectRowsNodeIds: nodeIds
        })
      })
      .toString();

    this.location.go(url);
  }

  updateRepChartData(sNodes: IRowNode<DataRow>[]) {
    let showChartForSelectedRows =
      this.uiQuery.getValue().showChartForSelectedRows;

    this.uiQuery.updatePart({
      repSelectedNodes: sNodes,
      gridData: this.data,
      repChartData: {
        rows:
          showChartForSelectedRows === true && sNodes.length > 0
            ? this.data.filter(
                row =>
                  sNodes.map(node => node.data.rowId).indexOf(row.rowId) > -1
              )
            : // : showChartForSelectedRows === true && sNodes.length > 1
              // ? []
              this.data.filter(row => row.showChart === true),
        columns: this.rep.columns
      }
    });
  }

  onRangeSelectionChanged(event: RangeSelectionChangedEvent<DataRow>) {
    // console.log('onRangeSelectionChanged');
  }

  onGridReady(params: GridReadyEvent<DataRow>) {
    this.agGridApi = params.api;

    this.uiQuery.updatePart({ gridApi: this.agGridApi });
    this.agGridApi.deselectAll();

    this.cd.detectChanges();
  }

  onColumnResized(params: ColumnResizedEvent<DataRow>) {
    if (common.isDefined(params.column)) {
      // console.log(params.column.getActualWidth());

      this.updateColumnSizes(params.column);
    }
  }

  rowDragEndHandle(event: RowDragEndEvent<DataRow>): void {
    let gridApi = event.api;

    let rowIds = [];
    let displayedRowsCount = gridApi.getDisplayedRowCount();
    for (let i = 0; i < displayedRowsCount; i++) {
      let rowNode = gridApi.getDisplayedRowAtIndex(i);
      rowIds.push(rowNode.data.rowId);
    }

    let selectedRep = this.repQuery.getValue();

    this.agGridApi.deselectAll();

    this.repService.modifyRows({
      rep: selectedRep,
      changeType: common.ChangeTypeEnum.Move,
      rowChange: undefined,
      rowIds: rowIds
    });
  }

  getRowHeight(params: RowHeightParams<DataRow>): number | undefined | null {
    let rowHeight = 0;

    if (common.isDefined(params.data.mconfig)) {
      let totalConditions = 0;

      params.data.parameters.forEach(x => {
        if (common.isDefined(x.conditions)) {
          x.conditions.forEach(y => (totalConditions = totalConditions + 1));
        }
      });

      if (totalConditions > 1) {
        params.data.parameters.forEach(x => {
          if (common.isDefined(x.conditions)) {
            x.conditions.forEach(y => {
              rowHeight = rowHeight + 25;
            });
          }

          rowHeight = rowHeight + 8;
        });

        rowHeight = rowHeight + 9;
      }
    }

    let minRowHeight =
      params.data.rowType === common.RowTypeEnum.Metric &&
      params.data.showParametersJson === true
        ? countLines({ input: params.data.parametersJson, lines: 1 }) * 20 + 8
        : 42;

    let finalRowHeight = Math.max(rowHeight, minRowHeight);

    let heightLimit = 600;

    if (finalRowHeight > heightLimit) {
      finalRowHeight = heightLimit;
    }

    params.data.finalRowHeight = finalRowHeight;

    return finalRowHeight;
  }
}

function countLines(item: { input: any; lines: number }) {
  let { input, lines } = item;
  if (common.isUndefined(input)) {
    lines = lines + 1;
  } else if (Array.isArray(input)) {
    //
    input.forEach((x: any) => {
      lines = countLines({ input: x, lines: lines });
    });

    if (input.length > 0) {
      lines = lines + 2;
    } else {
      lines = lines + 1;
    }
  } else if (input.constructor === Object) {
    //
    Object.keys(input).forEach((y: any) => {
      lines = countLines({ input: input[y], lines: lines });
    });
    if (Object.keys(input).length > 0) {
      lines = lines + 2;
    } else {
      lines = lines + 1;
    }
  } else {
    lines = lines + 1;
  }
  return lines;
}
