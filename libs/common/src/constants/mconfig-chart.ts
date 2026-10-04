import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { MconfigChartSeries } from '#common/types/blockml/parts/mconfig/mconfig-chart-series';
import type { MconfigChartXAxis } from '#common/types/blockml/parts/mconfig/mconfig-chart-x-axis';
import type { MconfigChartYAxis } from '#common/types/blockml/parts/mconfig/mconfig-chart-y-axis';

export const CHART_DEFAULT_SIZE_FIELD_VALUE = 'size_field_value';

export const DEFAULT_PIVOT_FIRST_COLUMN_WIDTH = 230;
export const DEFAULT_PIVOT_COLUMNS_WIDTH = 210;

export const DEFAULT_CHART_SERIES_LINE: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: 'line',
  yAxisIndex: 0
};

export const DEFAULT_CHART_SERIES_BAR: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: 'bar',
  yAxisIndex: 0
};
export const DEFAULT_CHART_SERIES_SCATTER: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: 'scatter',
  yAxisIndex: 0
};
export const DEFAULT_CHART_SERIES_PIE: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: 'pie',
  yAxisIndex: 0
};

export const DEFAULT_CHART_X_AXIS: MconfigChartXAxis = {
  scale: false
};

export const DEFAULT_CHART_Y_AXIS: MconfigChartYAxis = {
  scale: false
};

export const DEFAULT_CHART: MconfigChart = {
  isValid: true,
  type: 'table',
  title: 'Title',

  xField: null,
  yFields: [],
  multiField: null,
  pivotRows: [],
  pivotColumns: [],
  pivotValues: [],

  format: true,
  pivotTheme: 'standard',
  firstColumnWidth: DEFAULT_PIVOT_FIRST_COLUMN_WIDTH,
  valueColumnsWidth: DEFAULT_PIVOT_COLUMNS_WIDTH,

  xAxis: DEFAULT_CHART_X_AXIS,

  yAxis: [DEFAULT_CHART_Y_AXIS, DEFAULT_CHART_Y_AXIS],

  series: []
};
