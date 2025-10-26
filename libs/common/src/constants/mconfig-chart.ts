import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { MconfigChartSeries } from '~common/interfaces/blockml/mconfig-chart-series';
import { MconfigChartXAxis } from '~common/interfaces/blockml/mconfig-chart-x-axis';
import { MconfigChartYAxis } from '~common/interfaces/blockml/mconfig-chart-y-axis';

export const CHART_DEFAULT_SIZE_FIELD_VALUE = 'size_field_value';

export const DEFAULT_CHART_SERIES_LINE: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: ChartTypeEnum.Line,
  yAxisIndex: 0
};

export const DEFAULT_CHART_SERIES_BAR: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: ChartTypeEnum.Bar,
  yAxisIndex: 0
};
export const DEFAULT_CHART_SERIES_SCATTER: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: ChartTypeEnum.Scatter,
  yAxisIndex: 0
};
export const DEFAULT_CHART_SERIES_PIE: MconfigChartSeries = {
  dataField: undefined,
  dataRowId: undefined,
  type: ChartTypeEnum.Pie,
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
  type: ChartTypeEnum.Table,
  title: 'Title',

  xField: null,
  yFields: [],
  multiField: null,

  format: true,

  xAxis: DEFAULT_CHART_X_AXIS,

  yAxis: [DEFAULT_CHART_Y_AXIS, DEFAULT_CHART_Y_AXIS],

  series: []
};
