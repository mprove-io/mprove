import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import {
  BaseGridPlugin,
  type ColumnConfig,
  type HeaderClickEvent
} from '@toolbox-web/grid';
import type { GridConfig } from '@toolbox-web/grid-angular';
import {
  DEFAULT_PIVOT_COLUMNS_WIDTH,
  DEFAULT_PIVOT_FIRST_COLUMN_WIDTH
} from '#common/constants/mconfig-chart';
import { PivotAggEnum } from '#common/enums/chart/pivot-agg.enum';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import type { MconfigField } from '#common/types/backend/parts/mconfig-field';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig-chart';
import { StructQuery } from '#front/app/queries/struct.query';
import { DataService, type QDataRow } from '#front/app/services/data.service';

interface PivotTableRow {
  [key: string]: string | number | null;
}

interface PivotColumnResizeDetail {
  field: string;
  width: number;
}

interface PivotHeaderPart {
  label: string;
  isName: boolean;
}

interface PivotHeaderItem {
  text: string;
  parts: PivotHeaderPart[];
}

interface PivotFieldHeader {
  label: string;
  prefix: string[];
}

interface PivotValueFormatMetadata {
  currencyPrefix: string | undefined;
  currencySuffix: string | undefined;
  formatNumber: string | undefined;
  thousandsSeparator: string;
}

class PivotGeneratedHeaderPlugin extends BaseGridPlugin<{
  hasColumnDimensions: boolean;
  valueColumnsWidth: number;
  firstColumnWidth: number;
  measureHeaders: Record<string, PivotFieldHeader>;
  measureLabels: Record<string, string>;
  pivotColumnOrder: Record<string, number>;
  pivotValueFields: string[];
  rowHeaders: PivotFieldHeader[];
}> {
  static override readonly manifest = {
    hookPriority: { processColumns: 100 }
  };

  readonly name = 'myPivotGeneratedHeader';

  override processColumns(columns: readonly ColumnConfig[]): ColumnConfig[] {
    let processedColumns = columns.map(column => {
      if (column.field === '__pivotLabel') {
        return {
          ...column,
          __originalWidth: this.config.firstColumnWidth,
          header: this.makeRowGroupHeaderText(),
          headerLabelRenderer: () => this.makeRowGroupHeaderLabel(),
          width: this.config.firstColumnWidth
        };
      }

      let header = this.makePivotColumnHeader({
        column: column
      });

      if (!header) {
        return column;
      }

      return {
        ...column,
        __originalWidth: this.config.valueColumnsWidth,
        header: header.text,
        headerLabelRenderer: () =>
          this.makePivotColumnHeaderLabel({
            header: header
          }),
        width: this.config.valueColumnsWidth
      };
    });

    return this.sortPivotValueColumns({ columns: processedColumns });
  }

  private sortPivotValueColumns(item: { columns: ColumnConfig[] }) {
    let { columns } = item;

    if (!this.config.hasColumnDimensions) {
      return columns;
    }

    return [...columns].sort((a, b) => {
      let aOrder = this.getPivotValueColumnOrder({ column: a });
      let bOrder = this.getPivotValueColumnOrder({ column: b });

      if (aOrder === bOrder) {
        return (
          this.getPivotValueFieldOrder({ column: a }) -
          this.getPivotValueFieldOrder({ column: b })
        );
      }

      return aOrder - bOrder;
    });
  }

  private getPivotValueFieldOrder(item: { column: ColumnConfig }) {
    let { column } = item;
    let fieldParts = column.field.split('|');
    let valueField = fieldParts[fieldParts.length - 1];
    let order = this.config.pivotValueFields.indexOf(valueField);

    return order === -1 ? 0 : order;
  }

  private getPivotValueColumnOrder(item: { column: ColumnConfig }) {
    let { column } = item;

    if (column.field === '__pivotLabel') {
      return Number.NEGATIVE_INFINITY;
    }

    if (column.field === '__pivotTotal') {
      return Number.POSITIVE_INFINITY;
    }

    let fieldParts = column.field.split('|');
    let valueField = fieldParts[fieldParts.length - 1];
    let isPivotValueColumn =
      this.config.pivotValueFields.indexOf(valueField) > -1;

    if (!isPivotValueColumn || fieldParts.length < 2) {
      return Number.POSITIVE_INFINITY - 1;
    }

    let columnKey = fieldParts.slice(0, -1).join('|');

    return (
      this.config.pivotColumnOrder[columnKey] ?? Number.POSITIVE_INFINITY - 1
    );
  }

  private makePivotColumnHeader(item: { column: ColumnConfig }) {
    let { column } = item;
    let fieldParts = column.field.split('|');
    let valueField = fieldParts[fieldParts.length - 1];
    let isPivotValueColumn =
      this.config.pivotValueFields.indexOf(valueField) > -1;
    let measureLabel = this.config.measureLabels[valueField] || valueField;

    if (!isPivotValueColumn) {
      return undefined;
    }

    if (!this.config.hasColumnDimensions) {
      let measureHeader = this.config.measureHeaders[valueField];
      let measurePrefix = measureHeader?.prefix || [];
      let text =
        measurePrefix.length > 0
          ? `${measurePrefix.join(' ')}\n${measureLabel}`
          : measureLabel;

      return {
        dimensionLabels: [] as string[],
        measureLabel: measureLabel,
        measurePrefix: measurePrefix,
        text: text
      };
    }

    if (fieldParts.length < 2) {
      return undefined;
    }

    let dimensionLabels = fieldParts.slice(0, -1);
    let text = [measureLabel, ...dimensionLabels].join('\n');

    return {
      dimensionLabels: dimensionLabels,
      measureLabel: measureLabel,
      measurePrefix: [],
      text: text
    };
  }

  private makePivotColumnHeaderLabel(item: {
    header: {
      dimensionLabels: string[];
      measureLabel: string;
      measurePrefix: string[];
      text: string;
    };
  }) {
    let { header } = item;

    let container = document.createElement('span');
    container.className = 'm-pivot-generated-header';

    if (header.measurePrefix.length > 0) {
      let prefix = document.createElement('span');
      prefix.className = 'm-pivot-column-header-prefix';
      prefix.textContent = header.measurePrefix.join(' ');
      container.appendChild(prefix);
    }

    let measure = document.createElement('span');
    measure.className = 'm-pivot-column-header-measure';
    measure.textContent = header.measureLabel;
    container.appendChild(measure);

    header.dimensionLabels.forEach(dimensionLabel => {
      let dimension = document.createElement('span');
      dimension.className = 'm-pivot-column-header-dimension';
      dimension.textContent = dimensionLabel;
      container.appendChild(dimension);
    });

    return container;
  }

  private makeRowGroupHeaderText() {
    return this.config.rowHeaders
      .map(rowHeader => {
        if (this.config.rowHeaders.length === 1) {
          return rowHeader.prefix.length > 0
            ? `${rowHeader.prefix.join(' ')}\n${rowHeader.label}`
            : rowHeader.label;
        }

        return rowHeader.prefix.length > 0
          ? `${rowHeader.prefix.join(' ')} ${rowHeader.label}`
          : rowHeader.label;
      })
      .join('\n');
  }

  private makeRowGroupHeaderLabel() {
    let container = document.createElement('span');
    container.className = 'm-pivot-row-group-header';

    this.config.rowHeaders.forEach(rowHeader => {
      if (this.config.rowHeaders.length === 1) {
        if (rowHeader.prefix.length > 0) {
          let prefixRow = document.createElement('span');
          prefixRow.className = 'm-pivot-row-group-header-line';

          let prefix = document.createElement('span');
          prefix.className = 'm-pivot-column-header-prefix';
          prefix.textContent = rowHeader.prefix.join(' ');
          prefixRow.appendChild(prefix);

          container.appendChild(prefixRow);
        }

        let labelRow = document.createElement('span');
        labelRow.className = 'm-pivot-row-group-header-line';

        let label = document.createElement('span');
        label.className = 'm-pivot-column-header-measure';
        label.textContent = rowHeader.label;
        labelRow.appendChild(label);

        container.appendChild(labelRow);
        return;
      }

      let row = document.createElement('span');
      row.className = 'm-pivot-row-group-header-line';

      rowHeader.prefix.forEach(rowHeaderPrefix => {
        let prefix = document.createElement('span');
        prefix.className = 'm-pivot-column-header-prefix';
        prefix.style.fontWeight = '400';
        prefix.textContent = `${rowHeaderPrefix} `;
        row.appendChild(prefix);
      });

      let label = document.createElement('span');
      label.className = 'm-pivot-column-header-measure';
      label.textContent = rowHeader.label;
      row.appendChild(label);

      container.appendChild(row);
    });

    return container;
  }
}

class PivotAlwaysExpandedPlugin extends BaseGridPlugin<{ enabled: boolean }> {
  readonly name = 'mprovePivotAlwaysExpanded';

  override afterRender() {
    if (!this.config.enabled) {
      return;
    }

    let gridElement = this.grid as unknown as HTMLElement;
    let collapsedToggle = gridElement.querySelector(
      '.pivot-group-row .pivot-toggle[aria-label="Expand group"]'
    );

    if (!collapsedToggle) {
      return;
    }

    let pivotPlugin = this.grid.getPluginByName?.('pivot') as
      | { expandAll: () => void }
      | undefined;

    pivotPlugin?.expandAll();
  }
}

class PivotDescFirstSortPlugin extends BaseGridPlugin {
  static override readonly manifest = {
    hookPriority: { onHeaderClick: -20 }
  };

  readonly name = 'mprovePivotDescFirstSort';

  override onHeaderClick(event: HeaderClickEvent) {
    let field = event.field;
    let isPivotField = this.isPivotField({ field: field });

    if (!isPivotField) {
      return false;
    }

    let sortModel = this.getSortModel();
    let existingSort = sortModel.find(sort => sort.field === field);
    let nextSortModel: Array<{ field: string; direction: 'asc' | 'desc' }>;

    if (!existingSort) {
      nextSortModel = [{ field: field, direction: 'desc' }];
    } else if (existingSort.direction === 'desc') {
      nextSortModel = [{ field: field, direction: 'asc' }];
    } else {
      nextSortModel = [];
    }

    this.grid?.query?.('sort:set-model', nextSortModel);

    return true;
  }

  private getSortModel() {
    let results = this.grid?.query?.('sort:get-model', null);
    let firstResult = Array.isArray(results) ? results[0] : [];

    return Array.isArray(firstResult)
      ? (firstResult as Array<{ field: string; direction: 'asc' | 'desc' }>)
      : [];
  }

  private isPivotField(item: { field: string }) {
    let { field } = item;

    return (
      field === '__pivotLabel' ||
      field === '__pivotTotal' ||
      field.includes('|')
    );
  }
}

class PivotEmptyLastSortPlugin extends BaseGridPlugin {
  static override readonly manifest = {
    hookPriority: { processRows: 200 }
  };

  readonly name = 'mprovePivotEmptyLastSort';

  override processRows(rows: readonly PivotTableRow[]): PivotTableRow[] {
    let sortModel = this.getSortModel();
    let activeSort = sortModel[0];

    if (!activeSort || !this.isPivotField({ field: activeSort.field })) {
      return [...rows];
    }

    return this.sortRowsAtDepth({
      rows: [...rows],
      depth: 0,
      field: activeSort.field,
      direction: activeSort.direction
    });
  }

  private sortRowsAtDepth(item: {
    rows: PivotTableRow[];
    depth: number;
    field: string;
    direction: 'asc' | 'desc';
  }) {
    let { rows, depth, field, direction } = item;
    let blocks: PivotTableRow[][] = [];
    let index = 0;

    while (index < rows.length) {
      let row = rows[index];
      let rowDepth = this.getRowDepth({ row: row });

      if (rowDepth !== depth) {
        blocks.push([row]);
        index += 1;
        continue;
      }

      let blockEnd = index + 1;

      while (
        blockEnd < rows.length &&
        this.getRowDepth({ row: rows[blockEnd] }) > depth
      ) {
        blockEnd += 1;
      }

      let block = rows.slice(index, blockEnd);
      let children = block.slice(1);

      if (children.length > 0) {
        block = [
          block[0],
          ...this.sortRowsAtDepth({
            rows: children,
            depth: depth + 1,
            field: field,
            direction: direction
          })
        ];
      }

      blocks.push(block);
      index = blockEnd;
    }

    return blocks
      .sort((a, b) =>
        this.compareRows({
          a: a[0],
          b: b[0],
          field: field,
          direction: direction
        })
      )
      .flat();
  }

  private compareRows(item: {
    a: PivotTableRow;
    b: PivotTableRow;
    field: string;
    direction: 'asc' | 'desc';
  }) {
    let { a, b, field, direction } = item;
    let aValue = a[field];
    let bValue = b[field];
    let aIsEmpty = aValue === null || aValue === undefined || aValue === '';
    let bIsEmpty = bValue === null || bValue === undefined || bValue === '';

    if (aIsEmpty && bIsEmpty) {
      return 0;
    }

    if (aIsEmpty) {
      return 1;
    }

    if (bIsEmpty) {
      return -1;
    }

    let directionMultiplier = direction === 'desc' ? -1 : 1;

    return aValue > bValue
      ? directionMultiplier
      : aValue < bValue
        ? -directionMultiplier
        : 0;
  }

  private getSortModel() {
    let results = this.grid?.query?.('sort:get-model', null);
    let firstResult = Array.isArray(results) ? results[0] : [];

    return Array.isArray(firstResult)
      ? (firstResult as Array<{ field: string; direction: 'asc' | 'desc' }>)
      : [];
  }

  private getRowDepth(item: { row: PivotTableRow }) {
    let { row } = item;
    let depth = row.__pivotDepth;

    return typeof depth === 'number' ? depth : 0;
  }

  private isPivotField(item: { field: string }) {
    let { field } = item;

    return (
      field === '__pivotLabel' ||
      field === '__pivotTotal' ||
      field.includes('|')
    );
  }
}

@Component({
  standalone: false,
  selector: 'm-chart-pivot-table',
  templateUrl: './chart-pivot-table.component.html'
})
export class ChartPivotTableComponent implements OnChanges {
  private static themeLinkId = 'mprove-toolbox-grid-theme';
  private pendingColumnResizeDetail: PivotColumnResizeDetail | undefined;
  private mconfigFieldById = new Map<string, MconfigField>();
  private pivotValueFieldIds: string[] = [];
  private pivotValueFieldIdSet = new Set<string>();
  private pivotValueFormatMetadataByFieldId = new Map<
    string,
    PivotValueFormatMetadata
  >();
  private formattedPivotValueCache = new Map<string, string>();

  @Input()
  chart: MconfigChart;

  @Input()
  mconfigFields: MconfigField[];

  @Input()
  qData: QDataRow[];

  @Output()
  chartPartChange = new EventEmitter<MconfigChart>();

  rows: PivotTableRow[] = [];
  gridConfig: GridConfig<PivotTableRow>;

  measureListHeader: string;
  showMeasureListHeader: boolean;
  dimensionListHeader: string;
  measureHeaderItems: PivotHeaderItem[] = [];
  dimensionHeaderItems: PivotHeaderItem[] = [];

  customStyles: string = `
      :host {
        --tbw-grid-font-family: 'Montserrat', sans-serif;
      }

      .tbw-grid-root,
      .header-row .cell,
      .data-grid-row .cell,
      .pivot-group-row .cell,
      .pivot-leaf-row .cell,
      .pivot-grand-total-row .cell,
      .pivot-label,
      .pivot-count {
        font-family: 'Montserrat', sans-serif;
      }

      .header-row .cell,
      .data-grid-row .cell {
        border-right: 1px solid var(--tbw-color-border, #d1d5db);
        border-bottom: 1px solid var(--tbw-color-border, #d1d5db);
        padding-left: 20px;
      }

      .header-row .cell {
        font-size: 16px;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .header-row .cell .sort-indicator {
        align-items: center;
        color: #64748b;
        display: inline-flex;
        height: 32px;
        justify-content: center;
        margin-left: 8px;
        opacity: 0.8;
        width: 32px;
      }

      .header-row .cell[aria-sort='none'] .sort-indicator {
        opacity: 0;
      }

      .header-row .cell[aria-sort='none']:hover .sort-indicator {
        opacity: 0.8;
      }

      .header-row .cell[aria-sort='ascending'] .sort-indicator,
      .header-row .cell[aria-sort='descending'] .sort-indicator {
        color: #3b82f6;
      }

      .header-row .cell:first-child,
      .data-grid-row .cell:first-child {
        border-left: 1px solid var(--tbw-color-border, #d1d5db);
      }

      .header-row .cell {
        border-top: 1px solid var(--tbw-color-border, #d1d5db);
      }

      .pivot-group-row .cell:not(:first-child),
      .pivot-leaf-row .cell:not(:first-child),
      .pivot-grand-total-row .cell:not(:first-child) {
        justify-content: flex-end;
        text-align: right;
      }

      .header,
      .pivot-group-row,
      .pivot-group-row:hover {
        background: transparent !important;
      }

      .header-row,
      .data-grid-row,
      .pivot-group-row,
      .pivot-leaf-row,
      .pivot-grand-total-row {
        width: fit-content;
        min-width: 100%;
      }

      .header-row .cell:first-child,
      .header-row .cell:first-child:hover {
        background: #cdecfe !important;
      }

      .header-row .cell:not(:first-child),
      .header-row .cell:not(:first-child):hover {
        background: #b6e1bc !important;
      }

      .pivot-group-row .cell,
      .pivot-group-row:hover .cell {
        background: var(--tbw-pivot-group-bg, var(--tbw-color-row-alt)) !important;
      }

      .tbw-scroll-area,
      .faux-vscroll {
        scrollbar-color: transparent transparent;
        scrollbar-width: thin;
      }

      .faux-vscroll {
        background: transparent !important;
        height: calc(100% - 62px);
        margin-top: 62px;
        width: 8px;
      }

      .faux-vscroll-spacer {
        background: transparent !important;
      }

      .tbw-scroll-area:hover,
      .tbw-grid-root:hover .faux-vscroll,
      .faux-vscroll:hover,
      .tbw-scroll-area:focus-within,
      .tbw-grid-root:focus-within .faux-vscroll,
      .faux-vscroll:focus-within {
        scrollbar-color: var(--tbw-color-border, #d1d5db) transparent;
      }

      .tbw-scroll-area::-webkit-scrollbar,
      .faux-vscroll::-webkit-scrollbar {
        height: 8px;
        width: 8px;
      }

      .tbw-scroll-area::-webkit-scrollbar-thumb,
      .faux-vscroll::-webkit-scrollbar-thumb {
        background: transparent;
      }

      .tbw-scroll-area:hover::-webkit-scrollbar-thumb,
      .tbw-grid-root:hover .faux-vscroll::-webkit-scrollbar-thumb,
      .faux-vscroll:hover::-webkit-scrollbar-thumb,
      .tbw-scroll-area:focus-within::-webkit-scrollbar-thumb,
      .tbw-grid-root:focus-within .faux-vscroll::-webkit-scrollbar-thumb,
      .faux-vscroll:focus-within::-webkit-scrollbar-thumb {
        background: var(--tbw-color-border, #d1d5db);
      }

      .tbw-scroll-area::-webkit-scrollbar-track,
      .faux-vscroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .m-pivot-generated-header {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        font-family: 'Montserrat', sans-serif;
        justify-content: center;
        font-size: 16px;
        line-height: 1.35;
        min-width: max-content;
        text-align: left;
      }

      .m-pivot-row-group-header {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        font-family: 'Montserrat', sans-serif;
        justify-content: center;
        font-size: 16px;
        line-height: 1.35;
        text-align: left;
      }

      .m-pivot-row-group-header-line {
        display: block;
      }

      .header-row .cell[data-field='__pivotLabel'] {
        display: flex;
        gap: 0;
      }

      .header-row .cell[data-field='__pivotLabel'] > .sort-indicator {
        flex: 0 0 1.25em;
        margin-left: 0.25em;
      }

      .m-pivot-column-header-prefix {
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        font-weight: 400;
      }

      .m-pivot-column-header-measure {
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
      }

      .m-pivot-column-header-dimension {
        font-family: 'Montserrat', sans-serif;
        font-weight: 400;
      }

      .pivot-group-row .cell:not(:first-child) {
        color: transparent !important;
      }

      .pivot-group-row .cell:not(:first-child) * {
        visibility: hidden !important;
      }

      .pivot-group-row .pivot-toggle {
        display: none;
      }

      .pivot-group-row .pivot-label {
        margin-left: 20px;
      }

      .pivot-group-row .pivot-count {
        display: none;
      }
    `;

  constructor(
    private dataService: DataService,
    private structQuery: StructQuery
  ) {}

  @HostListener('document:mouseup')
  onDocumentMouseUp() {
    this.applyPendingColumnResize();
  }

  ngOnChanges() {
    this.preparePivotCaches();
    this.rows = this.makeRows();
    this.measureHeaderItems = this.makeMeasureHeaderItems();
    this.measureListHeader = this.measureHeaderItems
      .map(headerItem => headerItem.text)
      .join(', ');
    this.showMeasureListHeader = this.hasColumnDimensions();
    this.dimensionHeaderItems = this.makeDimensionHeaderItems();
    this.dimensionListHeader = this.dimensionHeaderItems
      .map(headerItem => headerItem.text)
      .join(', ');
    this.gridConfig = this.makeGridConfig();
    // this.setThemeStylesheet();
  }

  pivotColumnResize(event: Event) {
    let detail = (event as CustomEvent<PivotColumnResizeDetail>).detail;

    if (!detail?.field || !Number.isFinite(detail.width)) {
      return;
    }

    this.pendingColumnResizeDetail = {
      field: detail.field,
      width: Math.round(detail.width)
    };
  }

  private applyPendingColumnResize() {
    if (!this.pendingColumnResizeDetail) {
      return;
    }

    let { field, width } = this.pendingColumnResizeDetail;
    this.pendingColumnResizeDetail = undefined;

    if (field === '__pivotLabel') {
      this.chart.firstColumnWidth = width;
      this.gridConfig = this.makeGridConfig();
      this.chartPartChange.emit(<MconfigChart>{ firstColumnWidth: width });
      return;
    }

    if (this.isPivotValueColumn({ field: field })) {
      this.chart.valueColumnsWidth = width;
      this.gridConfig = this.makeGridConfig();
      this.chartPartChange.emit(<MconfigChart>{ valueColumnsWidth: width });
    }
  }

  private makeRows() {
    return (this.qData || []).map(row => {
      let pivotRow: PivotTableRow = {};

      this.mconfigFields.forEach(field => {
        let cell = row[field.id];
        let formattedValue = cell?.valueFmt ?? cell?.value;

        pivotRow[field.id] = this.pivotValueFieldIdSet.has(field.id)
          ? Number(cell?.value)
          : formattedValue;
      });

      return pivotRow;
    });
  }

  private makeGridConfig(): GridConfig<PivotTableRow> {
    return {
      icons: {
        sortAsc: this.makeSortIcon({ desc: false }),
        sortDesc: this.makeSortIcon({ desc: true }),
        sortNone: this.makeSortIcon({ desc: true })
      },
      columns: this.mconfigFields.map(field => ({
        field: field.id,
        header: field.groupLabel
          ? `${field.groupLabel} - ${field.label}`
          : field.label,
        sortable: true,
        resizable: true
      })),
      plugins: [
        new PivotGeneratedHeaderPlugin({
          hasColumnDimensions: this.hasColumnDimensions(),
          valueColumnsWidth: this.getPivotValueColumnsWidth(),
          firstColumnWidth: this.getPivotFirstColumnWidth(),
          measureHeaders: this.makePivotMeasureHeaders(),
          measureLabels: this.makePivotMeasureLabels(),
          pivotColumnOrder: this.makePivotColumnOrder(),
          pivotValueFields: this.pivotValueFieldIds,
          rowHeaders: (this.chart.pivotRows || []).map(fieldId => {
            let field = this.mconfigFieldById.get(fieldId);

            return {
              label: field?.label || fieldId,
              prefix: this.getPivotFieldPrefixes({ fieldId: fieldId })
            };
          })
        }),
        new PivotAlwaysExpandedPlugin({
          enabled: (this.chart.pivotRows || []).length > 1
        }),
        new PivotDescFirstSortPlugin(),
        new PivotEmptyLastSortPlugin()
      ],
      features: {
        shell: {
          header: {
            visible: false
          },
          toolPanel: {
            initialState: 'closed'
          }
        },
        multiSort: {
          maxSortColumns: 1,
          showSortIndex: false
        },
        pivot: {
          rowGroupFields: this.chart.pivotRows || [],
          columnGroupFields: this.chart.pivotColumns || [],
          animation: false,
          valueFields: (this.chart.pivotValues || []).map(pivotValue => ({
            field: pivotValue.field,
            aggFunc: PivotAggEnum.Sum,
            format: (value: number) =>
              this.formatPivotValue(pivotValue.field, value)
          })),
          showTotals: false,
          showGrandTotal: false,
          defaultExpanded: true,
          showToolPanel: false
        }
      }
    };
  }

  private makeSortIcon(item: { desc: boolean }) {
    let { desc } = item;
    let transform = desc ? 'rotate(90deg) scaleX(-1)' : 'rotate(90deg)';

    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        style="height: 20px; width: 20px; transform: ${transform};"
      >
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    `;
  }

  private makeMeasureHeaderItems() {
    return (this.chart.pivotValues || [])
      .map(pivotValue => {
        let field = this.mconfigFieldById.get(pivotValue.field);
        let name =
          // pivotValue.label ||
          field?.label || pivotValue.field;
        let prefixes = field ? [field.topLabel, field.groupLabel] : [];
        let parts = [
          ...prefixes
            .filter(label => !!label)
            .map(label => ({ label: label, isName: false })),
          { label: name, isName: true }
        ];

        return {
          text: parts.map(part => part.label).join(' '),
          parts: parts
        };
      })
      .filter(headerItem => !!headerItem.text);
  }

  private makeDimensionHeaderItems() {
    return (this.chart.pivotColumns || [])
      .map(fieldId => {
        let field = this.mconfigFieldById.get(fieldId);

        if (!field) {
          return {
            text: fieldId,
            parts: [{ label: fieldId, isName: true }]
          };
        }

        let parts = [
          ...[field.topLabel, field.groupLabel]
            .filter(label => !!label)
            .map(label => ({ label: label, isName: false })),
          { label: field.label, isName: true }
        ];

        return {
          text: parts.map(part => part.label).join(' '),
          parts: parts
        };
      })
      .filter(headerItem => !!headerItem.text);
  }

  private makePivotMeasureLabels() {
    let labels: Record<string, string> = {};

    (this.chart.pivotValues || []).forEach(pivotValue => {
      let field = this.mconfigFieldById.get(pivotValue.field);

      labels[pivotValue.field] =
        // pivotValue.label ||
        field?.label || pivotValue.field;
    });

    return labels;
  }

  private makePivotMeasureHeaders() {
    let headers: Record<string, PivotFieldHeader> = {};

    (this.chart.pivotValues || []).forEach(pivotValue => {
      let field = this.mconfigFieldById.get(pivotValue.field);

      headers[pivotValue.field] = {
        label:
          // pivotValue.label ||
          field?.label || pivotValue.field,
        prefix: this.getPivotFieldPrefixes({ fieldId: pivotValue.field })
      };
    });

    return headers;
  }

  private hasColumnDimensions() {
    return (this.chart.pivotColumns || []).length > 0;
  }

  private isPivotValueColumn(item: { field: string }) {
    let { field } = item;
    let fieldParts = field.split('|');
    let valueField = fieldParts[fieldParts.length - 1];

    return this.pivotValueFieldIdSet.has(valueField);
  }

  private getPivotFirstColumnWidth() {
    return this.chart.firstColumnWidth || DEFAULT_PIVOT_FIRST_COLUMN_WIDTH;
  }

  private getPivotValueColumnsWidth() {
    return this.chart.valueColumnsWidth || DEFAULT_PIVOT_COLUMNS_WIDTH;
  }

  private makePivotColumnOrder() {
    let order: Record<string, number> = {};
    let pivotColumns = this.chart.pivotColumns || [];

    if (pivotColumns.length === 0) {
      return order;
    }

    this.rows.forEach(row => {
      let columnKey = pivotColumns
        .map(fieldId => String(row[fieldId] ?? ''))
        .join('|');

      if (order[columnKey] === undefined) {
        order[columnKey] = Object.keys(order).length;
      }
    });

    return order;
  }

  private getPivotFieldPrefixes(item: { fieldId: string }) {
    let { fieldId } = item;
    let field = this.mconfigFieldById.get(fieldId);

    return [field?.topLabel, field?.groupLabel].filter(label => !!label);
  }

  private preparePivotCaches() {
    this.mconfigFieldById = new Map<string, MconfigField>();
    this.pivotValueFieldIds = (this.chart.pivotValues || []).map(
      pivotValue => pivotValue.field
    );
    this.pivotValueFieldIdSet = new Set(this.pivotValueFieldIds);
    this.pivotValueFormatMetadataByFieldId = new Map<
      string,
      PivotValueFormatMetadata
    >();
    this.formattedPivotValueCache = new Map<string, string>();

    (this.mconfigFields || []).forEach(field => {
      this.mconfigFieldById.set(field.id, field);
    });

    let struct = this.structQuery.getValue();

    this.pivotValueFieldIds.forEach(fieldId => {
      let field = this.mconfigFieldById.get(fieldId);
      let fieldThousandsSeparatorTag = field?.mproveTags?.find(
        tag => tag.key === ParameterEnum.ThousandsSeparator
      );
      let thousandsSeparator =
        fieldThousandsSeparatorTag?.value ??
        struct.mproveConfig.thousandsSeparator;
      let formatNumber =
        field?.formatNumber || struct.mproveConfig.formatNumber || undefined;

      this.pivotValueFormatMetadataByFieldId.set(fieldId, {
        currencyPrefix:
          field?.currencyPrefix ||
          struct.mproveConfig.currencyPrefix ||
          undefined,
        currencySuffix:
          field?.currencySuffix ||
          struct.mproveConfig.currencySuffix ||
          undefined,
        formatNumber: formatNumber,
        thousandsSeparator: thousandsSeparator
      });
    });
  }

  private formatPivotValue(fieldId: string, value: number) {
    let cacheKey = `${fieldId}::${value}`;
    let cachedValue = this.formattedPivotValueCache.get(cacheKey);

    if (cachedValue !== undefined) {
      return cachedValue;
    }

    let metadata = this.pivotValueFormatMetadataByFieldId.get(fieldId);

    if (!metadata) {
      return String(value);
    }

    if (!metadata.formatNumber) {
      let formattedValue = Number(value)
        .toLocaleString()
        .split(',')
        .join(metadata.thousandsSeparator);

      this.formattedPivotValueCache.set(cacheKey, formattedValue);

      return formattedValue;
    }

    let formattedValue = this.dataService.d3FormatValue({
      value: value,
      formatNumber: metadata.formatNumber,
      fieldResult: FieldResultEnum.Number,
      currencyPrefix: metadata.currencyPrefix,
      currencySuffix: metadata.currencySuffix,
      thousandsSeparator: metadata.thousandsSeparator
    });

    this.formattedPivotValueCache.set(cacheKey, formattedValue);

    return formattedValue;
  }

  // private setThemeStylesheet() {
  //   let theme = this.chart.pivotTheme || 'standard';
  //   let href = `/assets/toolbox-grid-themes/dg-theme-${theme}.css`;

  //   let link = document.getElementById(
  //     ChartPivotTableComponent.themeLinkId
  //   ) as HTMLLinkElement;

  //   if (!link) {
  //     link = document.createElement('link');
  //     link.id = ChartPivotTableComponent.themeLinkId;
  //     link.rel = 'stylesheet';
  //     document.head.appendChild(link);
  //   }

  //   if (link.href !== new URL(href, window.location.origin).href) {
  //     link.href = href;
  //   }
  // }
}
