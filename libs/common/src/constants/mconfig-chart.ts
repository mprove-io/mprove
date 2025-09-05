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
  hideColumns: [],
  // sizeField: null,
  multiField: null,

  format: true,

  xAxis: DEFAULT_CHART_X_AXIS,

  yAxis: [DEFAULT_CHART_Y_AXIS, DEFAULT_CHART_Y_AXIS],

  series: []
};

//
//
//

// interpolation: CHART_DEFAULT_INTERPOLATION,
// colorScheme: CHART_DEFAULT_COLOR_SCHEME,
// schemeType: CHART_DEFAULT_SCHEME_TYPE,

// cardColor: CHART_DEFAULT_CARD_COLOR,
// emptyColor: CHART_DEFAULT_EMPTY_COLOR,
// bandColor: CHART_DEFAULT_BAND_COLOR,
// textColor: CHART_DEFAULT_TEXT_COLOR,

// xAxisLabel: CHART_DEFAULT_X_AXIS_LABEL,
// yAxisLabel: CHART_DEFAULT_Y_AXIS_LABEL,
// legendTitle: CHART_DEFAULT_LEGEND_TITLE,
// units: CHART_DEFAULT_UNITS,

// arcWidth: CHART_DEFAULT_ARC_WIDTH,
// barPadding: CHART_DEFAULT_BAR_PADDING,
// groupPadding: CHART_DEFAULT_GROUP_PADDING,
// innerPadding: CHART_DEFAULT_INNER_PADDING,
// rangeFillOpacity: CHART_DEFAULT_RANGE_FILL_OPACITY,
// angleSpan: CHART_DEFAULT_ANGLE_SPAN,
// startAngle: CHART_DEFAULT_START_ANGLE,
// bigSegments: CHART_DEFAULT_BIG_SEGMENTS,
// smallSegments: CHART_DEFAULT_SMALL_SEGMENTS,
// min: CHART_DEFAULT_MIN,
// max: CHART_DEFAULT_MAX,
// yScaleMin: CHART_DEFAULT_Y_SCALE_MIN,
// yScaleMax: CHART_DEFAULT_Y_SCALE_MAX,
// xScaleMax: CHART_DEFAULT_X_SCALE_MAX,

// timeline: CHART_DEFAULT_TIMELINE,
// showAxis: CHART_DEFAULT_SHOW_AXIS,

// labels: CHART_DEFAULT_LABELS,
// showDataLabel: CHART_DEFAULT_SHOW_DATA_LABEL,
// autoScale: CHART_DEFAULT_AUTO_SCALE,
// legend: CHART_DEFAULT_LEGEND,
// doughnut: CHART_DEFAULT_DOUGHNUT,
// explodeSlices: CHART_DEFAULT_EXPLODE_SLICES,
// xAxis: CHART_DEFAULT_X_AXIS,
// yAxis: CHART_DEFAULT_Y_AXIS,
// showXAxisLabel: CHART_DEFAULT_SHOW_X_AXIS_LABEL,
// showYAxisLabel: CHART_DEFAULT_SHOW_Y_AXIS_LABEL,
// roundDomains: CHART_DEFAULT_ROUND_DOMAINS,
// showGridLines: CHART_DEFAULT_SHOW_GRID_LINES,
// roundEdges: CHART_DEFAULT_ROUND_EDGES,
// tooltipDisabled: CHART_DEFAULT_TOOLTIP_DISABLED,
// gradient: CHART_DEFAULT_GRADIENT,
// animations: CHART_DEFAULT_ANIMATIONS,

// formatNumberDataLabel: CHART_DEFAULT_FORMAT_NUMBER_DATA_LABEL,
// formatNumberValue: CHART_DEFAULT_FORMAT_NUMBER_VALUE,
// formatNumberAxisTick: CHART_DEFAULT_FORMAT_AXIS_TICK,
// formatNumberYAxisTick: CHART_DEFAULT_FORMAT_Y_AXIS_TICK,
// formatNumberXAxisTick: CHART_DEFAULT_FORMAT_X_AXIS_TICK

//
//
//

// export const CHART_DEFAULT_INTERPOLATION = ChartInterpolationEnum.Linear;
// export const CHART_DEFAULT_COLOR_SCHEME = ChartColorSchemeEnum.Soft;
// export const CHART_DEFAULT_SCHEME_TYPE = ChartSchemeTypeEnum.Ordinal;

// export const CHART_DEFAULT_CARD_COLOR = 'rgba(255, 255, 255, 100)';
// export const CHART_DEFAULT_EMPTY_COLOR = 'rgba(255, 255, 255, 100)';
// export const CHART_DEFAULT_BAND_COLOR = 'rgba(255, 255, 255, 100)';
// export const CHART_DEFAULT_TEXT_COLOR: string = undefined;

// export const CHART_DEFAULT_X_AXIS_LABEL = 'X axis label';
// export const CHART_DEFAULT_Y_AXIS_LABEL = 'Y axis label';
// export const CHART_DEFAULT_LEGEND_TITLE = 'Legend title';
// export const CHART_DEFAULT_UNITS = 'Units';

// export const CHART_DEFAULT_ARC_WIDTH = 0.25;
// export const CHART_DEFAULT_BAR_PADDING = 8;
// export const CHART_DEFAULT_GROUP_PADDING = 16;
// export const CHART_DEFAULT_INNER_PADDING = 8;
// export const CHART_DEFAULT_RANGE_FILL_OPACITY = 0.15;
// export const CHART_DEFAULT_ANGLE_SPAN = 240;
// export const CHART_DEFAULT_START_ANGLE = -120;
// export const CHART_DEFAULT_BIG_SEGMENTS = 10;
// export const CHART_DEFAULT_SMALL_SEGMENTS = 5;
// export const CHART_DEFAULT_MIN = 0;
// export const CHART_DEFAULT_MAX: number = undefined;
// export const CHART_DEFAULT_X_SCALE_MAX: number = undefined;
// export const CHART_DEFAULT_Y_SCALE_MIN: number = undefined;
// export const CHART_DEFAULT_Y_SCALE_MAX: number = undefined;

// export const CHART_DEFAULT_TIMELINE = false;
// export const CHART_DEFAULT_SHOW_AXIS = true;

// export const CHART_DEFAULT_LABELS = true;
// export const CHART_DEFAULT_SHOW_DATA_LABEL = true;

// export const CHART_DEFAULT_AUTO_SCALE = false;
// export const CHART_DEFAULT_LEGEND = true;
// export const CHART_DEFAULT_DOUGHNUT = false;
// export const CHART_DEFAULT_EXPLODE_SLICES = false;
// export const CHART_DEFAULT_X_AXIS = true;
// export const CHART_DEFAULT_Y_AXIS = true;
// export const CHART_DEFAULT_SHOW_X_AXIS_LABEL = false;
// export const CHART_DEFAULT_SHOW_Y_AXIS_LABEL = false;
// export const CHART_DEFAULT_ROUND_DOMAINS = true;
// export const CHART_DEFAULT_SHOW_GRID_LINES = true;
// export const CHART_DEFAULT_ROUND_EDGES = true;
// export const CHART_DEFAULT_TOOLTIP_DISABLED = false;
// export const CHART_DEFAULT_GRADIENT = false;
// export const CHART_DEFAULT_ANIMATIONS = false;

// export const CHART_DEFAULT_FORMAT_NUMBER_DATA_LABEL: string = undefined;
// export const CHART_DEFAULT_FORMAT_NUMBER_VALUE: string = undefined;
// export const CHART_DEFAULT_FORMAT_AXIS_TICK: string = undefined;
// export const CHART_DEFAULT_FORMAT_Y_AXIS_TICK: string = undefined;
// export const CHART_DEFAULT_FORMAT_X_AXIS_TICK: string = undefined;
