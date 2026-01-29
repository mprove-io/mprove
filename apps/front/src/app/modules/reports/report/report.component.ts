import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  ColumnResizedEvent,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  IRowNode,
  RangeSelectionChangedEvent,
  RowClickedEvent,
  RowDragEndEvent,
  RowHeightParams,
  SelectionChangedEvent,
  themeAlpine
} from 'ag-grid-community';
// import { MultiRowSelectionOptions } from 'ag-grid-community/dist/types/src/entities/gridOptions';
import { combineLatest, tap } from 'rxjs';
import { debounce } from 'throttle-debounce';
import { TRIPLE_UNDERSCORE } from '#common/constants/top';
import {
  DEFAULT_METRICS_COLUMN_NAME_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_NARROW_WIDTH,
  DEFAULT_METRICS_TIME_COLUMNS_WIDE_WIDTH
} from '#common/constants/top-front';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { getTimeSpecDetail } from '#common/functions/get-timespec-detail';
import { getTimeSpecWord } from '#common/functions/get-timespec-word';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { ReportX } from '#common/interfaces/backend/report-x';
import { Row } from '#common/interfaces/blockml/row';
import { DataRow } from '#common/interfaces/front/data-row';
import { ReportQuery } from '#front/app/queries/report.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ReportService } from '#front/app/services/report.service';
import { UiService } from '#front/app/services/ui.service';
import { ChartHeaderComponent } from './chart-header/chart-header.component';
import { ChartRendererComponent } from './chart-renderer/chart-renderer.component';
import { DataRendererComponent } from './data-renderer/data-renderer.component';
import { MetricHeaderComponent } from './metric-header/metric-header.component';
import { MetricRendererComponent } from './metric-renderer/metric-renderer.component';
import { MiniChartHeaderComponent } from './mini-chart-header/mini-chart-header.component';
import { MiniChartRendererComponent } from './mini-chart-renderer/mini-chart-renderer.component';
import { RowIdHeaderComponent } from './row-id-header/row-id-header.component';
import { RowIdRendererComponent } from './row-id-renderer/row-id-renderer.component';
import { StatusHeaderComponent } from './status-header/status-header.component';
import { StatusRendererComponent } from './status-renderer/status-renderer.component';

@Component({
  standalone: false,
  selector: 'm-report',
  styleUrls: ['report.component.scss'],
  templateUrl: './report.component.html'
})
export class ReportComponent {
  rowSelection: any = {
    // MultiRowSelectionOptions<DataRow>
    mode: 'multiRow',
    enableSelectionWithoutKeys: false,
    enableClickSelection: true,
    headerCheckbox: false,
    checkboxes: false
  };

  gridTheme = themeAlpine.withParams({
    wrapperBorder: '1px solid #99a1af',
    headerRowBorder: '1px solid #99a1af',
    headerColumnBorder: '1px solid #dde2eb',
    pinnedColumnBorder: '1.5px solid #99a1af',
    columnBorder: '1px solid #dde2eb',
    headerBackgroundColor: '#f8f8f8',
    headerFontFamily: 'arial, sans-serif',
    headerFontSize: '17px',
    fontFamily: 'Montserrat',
    fontSize: '17px',
    dataFontSize: '17px',
    selectedRowBackgroundColor: 'rgb(255, 224, 129)',
    rowHoverColor: 'rgb(0, 0, 0, 0)',
    oddRowBackgroundColor: 'rgb(0, 0, 0, 0)',
    backgroundColor: 'rgb(0, 0, 0, 0)',
    rangeSelectionBorderColor: 'rgb(0, 0, 0, 0)',
    focusShadow: 'none'
  });

  overlayNoRowsTemplate = `
    <span style="font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 20px; color: #4D4F5C">
      To add a row, click the plus button in the upper left corner
    </span>
  `;

  updateColumnSizes = debounce(
    300,
    paramsColumn => {
      if (isDefined(this.agGridApi)) {
        let columns = this.agGridApi.getColumns();

        let nameColumn = columns.find(x => x.getColId() === 'name');

        let uiState = this.uiQuery.getValue();

        this.uiQuery.updatePart({
          metricsColumnNameWidth: nameColumn.getActualWidth(),
          metricsTimeColumnsNarrowWidth:
            ['name', 'parameters'].indexOf(paramsColumn.colId) > -1
              ? uiState.metricsTimeColumnsNarrowWidth
              : [
                    TimeSpecEnum.Timestamps,
                    TimeSpecEnum.Minutes,
                    TimeSpecEnum.Hours
                  ].indexOf(uiState.timeSpec) > -1
                ? uiState.metricsTimeColumnsNarrowWidth
                : paramsColumn.getActualWidth(),
          metricsTimeColumnsWideWidth:
            ['name', 'parameters'].indexOf(paramsColumn.colId) > -1
              ? uiState.metricsTimeColumnsWideWidth
              : [
                    TimeSpecEnum.Timestamps,
                    TimeSpecEnum.Minutes,
                    TimeSpecEnum.Hours
                  ].indexOf(uiState.timeSpec) > -1
                ? paramsColumn.getActualWidth()
                : uiState.metricsTimeColumnsWideWidth
        });

        uiState = this.uiQuery.getValue();
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
    },
    {
      field: 'name',
      pinned: 'left',
      minWidth: DEFAULT_METRICS_COLUMN_NAME_WIDTH,
      headerComponent: MetricHeaderComponent,
      cellRenderer: MetricRendererComponent
    },
    {
      field: 'chart' as any,
      pinned: 'left',
      resizable: false,
      width: 70,
      headerComponent: ChartHeaderComponent,
      cellRenderer: ChartRendererComponent
    }
  ];

  miniChartColumn: ColDef<DataRow> = {
    field: 'mini-chart' as any,
    pinned: 'right',
    resizable: false,
    width: 180,
    headerComponent: MiniChartHeaderComponent,
    cellRenderer: MiniChartRendererComponent
  };

  statusColumn: ColDef<DataRow> = {
    field: 'status' as any,
    pinned: 'right',
    resizable: false,
    width: 84,
    headerComponent: StatusHeaderComponent,
    cellRenderer: StatusRendererComponent
  };

  columnTypes = {
    running: {}
  };

  columnDefs: ColDef<DataRow>[] = [...this.columns, this.statusColumn];
  timeColumns: ColDef<DataRow>[] = [];
  firstDataTimeColumnIndex: number;
  lastDataTimeColumnIndex: number;

  defaultColDef: ColDef<DataRow> = {
    sortable: false,
    suppressMovable: true,
    resizable: true,
    editable: false,
    suppressHeaderKeyboardEvent: params => true,
    suppressKeyboardEvent: params => true
  };

  agGridApi: GridApi<DataRow>;

  report: ReportX;
  report$ = combineLatest([
    this.reportQuery.select(),
    this.uiQuery.timeColumnsNarrowWidth$,
    this.uiQuery.timeColumnsWideWidth$,
    this.uiQuery.showMetricsParameters$,
    this.uiQuery.showMiniCharts$
  ]).pipe(
    tap(
      ([
        report,
        timeColumnsNarrowWidth,
        timeColumnsWideWidth,
        showMetricsParameters, // used in check update data
        showMiniCharts
      ]: [ReportX, number, number, boolean, boolean]) => {
        this.report = report;

        let uiState = this.uiQuery.getValue();

        let nameColumn = this.columns.find(c => c.field === 'name');

        nameColumn.width = uiState.metricsColumnNameWidth;

        this.timeColumns = this.report.columns.map(column => {
          let columnDef: ColDef<DataRow> = {
            field: `${column.columnId * 1000}` as any,
            headerName: column.label,
            cellRenderer: DataRendererComponent,
            type: 'numericColumn',
            width:
              [
                TimeSpecEnum.Timestamps,
                TimeSpecEnum.Minutes,
                TimeSpecEnum.Hours
              ].indexOf(uiState.timeSpec) > -1
                ? Math.max(
                    DEFAULT_METRICS_TIME_COLUMNS_WIDE_WIDTH,
                    timeColumnsWideWidth
                  )
                : Math.max(
                    DEFAULT_METRICS_TIME_COLUMNS_NARROW_WIDTH,
                    timeColumnsNarrowWidth
                  ),
            minWidth:
              [
                TimeSpecEnum.Timestamps,
                TimeSpecEnum.Minutes,
                TimeSpecEnum.Hours
              ].indexOf(uiState.timeSpec) > -1
                ? 220
                : 155,
            maxWidth: 300,
            resizable: true
          };

          return columnDef;
        });

        this.firstDataTimeColumnIndex = this.timeColumns.findIndex(
          timeColumn => {
            let columnRow = this.report.rows.find(row => {
              let rowRecord = row.records.find(
                record => record.key * 1000 === Number(timeColumn.field)
              );

              return (
                isDefined(rowRecord) && isDefinedAndNotEmpty(rowRecord.value)
              );
            });

            return isDefined(columnRow);
          }
        );

        let timeColumnsReversed = [...this.timeColumns].reverse();

        let lastDataTimeColumnIndexReversed = timeColumnsReversed.findIndex(
          timeColumn => {
            let columnRow = this.report.rows.find(row => {
              let rowRecord = row.records.find(
                record => record.key * 1000 === Number(timeColumn.field)
              );

              return (
                isDefined(rowRecord) && isDefinedAndNotEmpty(rowRecord.value)
              );
            });

            return isDefined(columnRow);
          }
        );

        this.lastDataTimeColumnIndex =
          isDefined(lastDataTimeColumnIndexReversed) &&
          lastDataTimeColumnIndexReversed > -1
            ? this.timeColumns.length - 1 - lastDataTimeColumnIndexReversed
            : -1;

        let trimmedTimeColumns = this.report.isTimeColumnsLimitExceeded
          ? this.timeColumns
          : this.firstDataTimeColumnIndex > 0
            ? this.timeColumns.filter(
                (c, i) =>
                  i >= this.firstDataTimeColumnIndex &&
                  i <= this.lastDataTimeColumnIndex
              )
            : this.timeColumns;

        let runningQueriesLength = this.report.rows
          .filter(row => isDefined(row.query))
          .map(row => row.query.status)
          .filter(status => status === QueryStatusEnum.Running).length;

        this.statusColumn.type =
          runningQueriesLength > 0 ? 'running' : undefined;

        this.columnDefs =
          showMiniCharts === true
            ? [
                ...this.columns,
                ...trimmedTimeColumns,
                this.miniChartColumn,
                this.statusColumn
              ]
            : [...this.columns, ...trimmedTimeColumns, this.statusColumn];

        this.checkUpdateData();
      }
    )
  );

  checkUpdateData() {
    let showMetricsParameters = this.uiQuery.getValue().showMetricsParameters;

    let newData = this.report.rows.map((row: Row) => {
      let dataRow: DataRow = Object.assign({}, row, <DataRow>{
        showMetricsParameters: showMetricsParameters
      });

      row.records.forEach(record => {
        let column = this.report.columns.find(c => c.columnId === record.key);

        record.columnLabel = column?.label;

        if (isDefined(record.columnLabel)) {
          (dataRow as any)[record.key * 1000] = record.value;
        }
      });

      return dataRow;
    });

    if (isDefined(this.agGridApi)) {
      this.agGridApi.setGridOption('rowData', newData);
      this.agGridApi.resetRowHeights();

      this.data = newData;

      this.uiQuery.getValue().reportSelectedNodes.forEach(node => {
        let rowNode = this.agGridApi.getRowNode(node.id);
        if (isDefined(rowNode)) {
          rowNode.setSelected(true);
        }
      });

      let sNodes = this.uiQuery.getValue().reportSelectedNodes;
      this.updateRepChartData(sNodes);
    }

    this.cd.detectChanges();
  }

  lastSelectionChangedTs = 0;
  lastRowClickedTs = 0;

  @ViewChild(AgGridAngular) agGrid: AgGridAngular<DataRow>;

  constructor(
    private cd: ChangeDetectorRef,
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private uiService: UiService
  ) {}

  getRowId(params: GetRowIdParams<DataRow>) {
    return params.data.rowId;
  }

  onRowClicked(event: RowClickedEvent<DataRow>) {
    this.lastRowClickedTs = Date.now();

    let isSelected = event.node.isSelected();

    setTimeout(() => {
      let diffClickedToSelection = Date.now() - this.lastSelectionChangedTs;
      if (isSelected === true && diffClickedToSelection > 250) {
        event.node.setSelected(false);
      }
    }, 0);
  }

  onSelectionChanged(event: SelectionChangedEvent<DataRow>) {
    let dateNow = Date.now();
    let diffSelectionToClicked = dateNow - this.lastRowClickedTs;
    this.lastSelectionChangedTs = dateNow;

    let sNodes = event.api.getSelectedNodes();
    this.updateRepChartData(sNodes);

    let nodeIds = sNodes.map(node => node.id);
  }

  updateRepChartData(sNodes: IRowNode<DataRow>[]) {
    this.uiQuery.updatePart({
      reportSelectedNodes: sNodes,
      gridData: this.data,
      repChartData: {
        rows: this.data,
        columns: this.report.columns,
        firstDataTimeColumnIndex: this.firstDataTimeColumnIndex,
        lastDataTimeColumnIndex: this.lastDataTimeColumnIndex
      }
    });
  }

  onRangeSelectionChanged(event: RangeSelectionChangedEvent<DataRow>) {}

  onGridReady(params: GridReadyEvent<DataRow>) {
    this.agGridApi = params.api;

    this.uiQuery.updatePart({ gridApi: this.agGridApi });
    this.agGridApi.deselectAll();

    if (isDefined(this.report)) {
      this.checkUpdateData();
    }

    this.cd.detectChanges();
  }

  onColumnResized(params: ColumnResizedEvent<DataRow>) {
    if (isDefined(params.column)) {
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

    let report = this.reportQuery.getValue();

    this.agGridApi.deselectAll();

    this.reportService.modifyRows({
      report: report,
      changeType: ChangeTypeEnum.Move,
      rowChange: undefined,
      rowIds: rowIds,
      reportFields: report.fields,
      chart: undefined
    });
  }

  getRowHeight(params: RowHeightParams<DataRow>): number | undefined | null {
    let rowHeight = 42;

    let isShowParameters = params.data.showMetricsParameters === true;

    if (isDefined(params.data.mconfig) && isShowParameters === true) {
      let struct = this.structQuery.getValue();

      let metric = struct.metrics.find(
        y => y.metricId === params.data.metricId
      );

      let timeSpec = this.reportQuery.getValue().timeSpec;

      let timeSpecWord = getTimeSpecWord({ timeSpec: timeSpec });

      let timeSpecDetail = getTimeSpecDetail({
        timeSpec: timeSpec,
        weekStart: struct.mproveConfig.weekStart
      });

      let timeFieldIdSpec =
        metric.modelType === ModelTypeEnum.Malloy
          ? timeSpecDetail === DetailUnitEnum.Timestamps
            ? `${metric.timeFieldId}_ts`
            : [DetailUnitEnum.WeeksSunday, DetailUnitEnum.WeeksMonday].indexOf(
                  timeSpecDetail
                ) > -1
              ? `${metric.timeFieldId}_week`
              : `${metric.timeFieldId}_${timeSpecDetail.slice(0, -1)}`
          : `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${timeSpecWord}`;

      let extendedFilters =
        metric.modelType === ModelTypeEnum.Store
          ? params.data.mconfig.extendedFilters
          : params.data.mconfig.extendedFilters.filter(
              filter => filter.fieldId !== timeFieldIdSpec
            );

      if (extendedFilters.length > 0) {
        extendedFilters.forEach(x => {
          if (isDefined(x.fractions)) {
            x.fractions.forEach(y => {
              if (isDefined(y.controls)) {
                y.controls?.forEach(c => {
                  rowHeight = rowHeight + 25;
                });
              } else {
                rowHeight = rowHeight + 25;
              }
            });
          }

          rowHeight = rowHeight + 8;
        });

        rowHeight = rowHeight + 9;
      }
    }

    params.data.finalRowHeight = rowHeight;

    return rowHeight;
  }
}
