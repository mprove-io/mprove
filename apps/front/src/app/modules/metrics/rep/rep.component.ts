import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
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
      width: 80,
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

      this.timeColumns = x.columns.map(column => {
        let columnDef: ColDef<DataRow> = {
          field: `${column.columnId}`,
          headerName: column.label,
          cellRenderer: DataRendererComponent,
          type: 'numericColumn'
        };

        return columnDef;
      });

      this.columnDefs = [...this.columns, ...this.timeColumns];

      let metrics = this.metricsQuery.getValue();

      this.data = x.rows.map((row: common.Row) => {
        let metric = metrics.metrics.find(m => m.metricId === row.metricId);

        let dataRow: DataRow = {
          rowId: row.rowId,
          parameters: '',
          metric: metric?.label || row.metricId,
          showChart: row.showChart,
          idx: row.rowId,
          query: row.query,
          metricId: row.metricId,
          mconfig: row.mconfig,
          hasAccessToModel: row.hasAccessToModel,
          formula: row.formula,
          formulaDeps: row.formulaDeps,
          params: row.params,
          records: row.records,
          rqs: row.rqs,
          currencyPrefix: metric?.currencyPrefix || row.currencyPrefix,
          currencySuffix: metric?.currencySuffix || row.currencySuffix,
          formatNumber: metric?.formatNumber || row.formatNumber
        };

        row.records
          .filter(record => record.key !== 0)
          .forEach(record => {
            dataRow[record.key] = record.value;
            let column = x.columns.find(c => c.columnId === record.key);
            record.columnLabel = column.label;
          });

        return dataRow;
      });

      let sNodes = this.uiQuery.getValue().repSelectedNodes;

      // console.log(sNodes);

      this.updateRepChartData(sNodes);

      this.cd.detectChanges();
    })
  );

  formulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  repSelectedNode: IRowNode<DataRow>;
  repSelectedNodes$ = this.uiQuery.repSelectedNodes$.pipe(
    tap(x => {
      this.repSelectedNode = x.length === 1 ? x[0] : undefined;

      if (
        common.isDefined(this.repSelectedNode) &&
        common.isDefined(this.repSelectedNode.data.formula)
      ) {
        setValueAndMark({
          control: this.formulaForm.controls['formula'],
          value: this.repSelectedNode.data.formula
        });
      }
    })
  );

  @ViewChild(AgGridAngular) agGrid: AgGridAngular<DataRow>;

  constructor(
    private cd: ChangeDetectorRef,
    private repQuery: RepQuery,
    private repService: RepService,
    private uiQuery: UiQuery,
    private fb: FormBuilder,
    private metricsQuery: MetricsQuery
  ) {}

  onSelectionChanged(event: SelectionChangedEvent<DataRow>) {
    let sNodes = event.api.getSelectedNodes();
    this.updateRepChartData(sNodes);

    // console.log('onSelectionChanged', sNodes);
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

  formulaBlur() {
    let value = this.formulaForm.controls['formula'].value;

    if (
      !this.formulaForm.valid ||
      this.repSelectedNode.data.formula === value
    ) {
      return;
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      formula: value
    };

    if (rep.draft === true) {
      this.repService.editDraftRep({
        repId: rep.repId,
        changeType: common.ChangeTypeEnum.EditFormula,
        rowChanges: [rowChange]
      });
    } else {
      this.repService.navCreateDraftRep({
        fromRepId: rep.repId,
        fromDraft: rep.draft,
        rowChanges: [rowChange],
        changeType: common.ChangeTypeEnum.EditFormula
      });
    }
  }
}
