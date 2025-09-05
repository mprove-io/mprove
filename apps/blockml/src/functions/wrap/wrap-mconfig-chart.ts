import {
  DEFAULT_CHART,
  DEFAULT_CHART_Y_AXIS
} from '~common/constants/mconfig-chart';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeCopy } from '~common/functions/make-copy';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FileChartData } from '~common/interfaces/blockml/internal/file-chart-data';
import { FileChartOptions } from '~common/interfaces/blockml/internal/file-chart-options';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { MconfigChartSeries } from '~common/interfaces/blockml/mconfig-chart-series';
import { MconfigChartXAxis } from '~common/interfaces/blockml/mconfig-chart-x-axis';
import { MconfigChartYAxis } from '~common/interfaces/blockml/mconfig-chart-y-axis';

export function wrapMconfigChart(item: {
  title: string;
  description: string;
  type: ChartTypeEnum;
  options: FileChartOptions;
  data: FileChartData;
  isReport: boolean;
  rowIdsWithShowChart: string[];
}) {
  let {
    title,
    description,
    type,
    options,
    data,
    rowIdsWithShowChart,
    isReport
  } = item;

  let xAxis: MconfigChartXAxis = {
    scale: isDefined(options?.x_axis?.scale)
      ? toBooleanFromLowercaseString(options?.x_axis?.scale)
      : DEFAULT_CHART.xAxis.scale
  };

  let yAxis: MconfigChartYAxis[] = [];

  if (isDefined(options?.y_axis) && options?.y_axis.length > 0) {
    yAxis = options?.y_axis.map(yAxisPart => {
      let yAxisElement = {
        scale: isDefined(yAxisPart.scale)
          ? toBooleanFromLowercaseString(yAxisPart.scale)
          : DEFAULT_CHART_Y_AXIS.scale
      };

      return yAxisElement;
    });
  } else {
    yAxis = [makeCopy(DEFAULT_CHART_Y_AXIS)];
  }

  if (yAxis.length === 1) {
    yAxis = [...yAxis, makeCopy(DEFAULT_CHART_Y_AXIS)];
  }

  let series: MconfigChartSeries[] = [];

  let seriesIds =
    isReport === false && isDefined(data?.y_fields)
      ? data?.y_fields
      : isReport === true && isDefined(rowIdsWithShowChart)
        ? rowIdsWithShowChart
        : [];

  series = seriesIds.map(seriesId => {
    let seriesPart = options?.series?.find(s =>
      isReport === false
        ? s.data_field === seriesId
        : s.data_row_id === seriesId
    );

    let seriesElement: MconfigChartSeries = {
      dataField: isReport === false ? seriesId : undefined,
      dataRowId: isReport === true ? seriesId : undefined,
      type: isDefined(seriesPart?.type) ? seriesPart.type : type,
      yAxisIndex: isDefined(seriesPart?.y_axis_index)
        ? Number(seriesPart.y_axis_index)
        : 0
    };

    return seriesElement;
  });

  let mconfigChart: MconfigChart = {
    isValid: true,
    title: title,
    description: description,
    type: type,

    // data
    xField: data?.x_field,
    yFields: data?.y_fields || [],
    hideColumns: data?.hide_columns || [],
    multiField: data?.multi_field,

    // options
    format: isDefined(options?.format)
      ? toBooleanFromLowercaseString(options?.format)
      : DEFAULT_CHART.format,
    xAxis: xAxis,
    yAxis: yAxis,
    series: series
  };

  return mconfigChart;
}

// animations: isDefined(tile.options?.animations)
//   ? toBooleanFromLowercaseString(tile.options?.animations)
//   : CHART_DEFAULT_ANIMATIONS,

// showDataLabel: isDefined(tile.options?.show_data_label)
//   ? toBooleanFromLowercaseString(tile.options?.show_data_label)
//   : CHART_DEFAULT_SHOW_DATA_LABEL,

// gradient: isDefined(tile.options?.gradient)
//   ? toBooleanFromLowercaseString(tile.options?.gradient)
//   : CHART_DEFAULT_GRADIENT,

// legend: isDefined(tile.options?.legend)
//   ? toBooleanFromLowercaseString(tile.options?.legend)
//   : CHART_DEFAULT_LEGEND,

// legendTitle:
//   tile.options?.legend_title || CHART_DEFAULT_LEGEND_TITLE,

// tooltipDisabled: isDefined(tile.options?.tooltip_disabled)
//   ? toBooleanFromLowercaseString(tile.options?.tooltip_disabled)
//   : CHART_DEFAULT_TOOLTIP_DISABLED,

// roundEdges: isDefined(tile.options?.round_edges)
//   ? toBooleanFromLowercaseString(tile.options?.round_edges)
//   : CHART_DEFAULT_ROUND_EDGES,

// roundDomains: isDefined(tile.options?.round_domains)
//   ? toBooleanFromLowercaseString(tile.options?.round_domains)
//   : CHART_DEFAULT_ROUND_DOMAINS,

// showGridLines: isDefined(tile.options?.show_grid_lines)
//   ? toBooleanFromLowercaseString(tile.options?.show_grid_lines)
//   : CHART_DEFAULT_SHOW_GRID_LINES,

// timeline: isDefined(tile.options?.timeline)
//   ? toBooleanFromLowercaseString(tile.options?.timeline)
//   : CHART_DEFAULT_TIMELINE,

// interpolation:
//   tile.options?.interpolation || CHART_DEFAULT_INTERPOLATION,

// autoScale: isDefined(tile.options?.auto_scale)
//   ? toBooleanFromLowercaseString(tile.options?.auto_scale)
//   : CHART_DEFAULT_AUTO_SCALE,

// doughnut: isDefined(tile.options?.doughnut)
//   ? toBooleanFromLowercaseString(tile.options?.doughnut)
//   : CHART_DEFAULT_DOUGHNUT,

// explodeSlices: isDefined(tile.options?.explode_slices)
//   ? toBooleanFromLowercaseString(tile.options?.explode_slices)
//   : CHART_DEFAULT_EXPLODE_SLICES,

// labels: isDefined(tile.options?.labels)
//   ? toBooleanFromLowercaseString(tile.options?.labels)
//   : CHART_DEFAULT_LABELS,

// colorScheme:
//   tile.options?.color_scheme || CHART_DEFAULT_COLOR_SCHEME,

// schemeType: tile.options?.scheme_type || CHART_DEFAULT_SCHEME_TYPE,

// arcWidth: isDefined(tile.options?.arc_width)
//   ? Number(tile.options.arc_width)
//   : CHART_DEFAULT_ARC_WIDTH,

// barPadding: isDefined(tile.options?.bar_padding)
//   ? Number(tile.options.bar_padding)
//   : CHART_DEFAULT_BAR_PADDING,

// groupPadding: isDefined(tile.options?.group_padding)
//   ? Number(tile.options.group_padding)
//   : CHART_DEFAULT_GROUP_PADDING,

// innerPadding: isDefined(tile.options?.inner_padding)
//   ? Number(tile.options.inner_padding)
//   : CHART_DEFAULT_INNER_PADDING,

// rangeFillOpacity: isDefined(tile.options?.range_fill_opacity)
//   ? Number(tile.options.range_fill_opacity)
//   : CHART_DEFAULT_RANGE_FILL_OPACITY,

// angleSpan: isDefined(tile.options?.angle_span)
//   ? Number(tile.options.angle_span)
//   : CHART_DEFAULT_ANGLE_SPAN,

// startAngle: isDefined(tile.options?.start_angle)
//   ? Number(tile.options.start_angle)
//   : CHART_DEFAULT_START_ANGLE,

// bigSegments: isDefined(tile.options?.big_segments)
//   ? Number(tile.options.big_segments)
//   : CHART_DEFAULT_BIG_SEGMENTS,

// smallSegments: isDefined(tile.options?.small_segments)
//   ? Number(tile.options.small_segments)
//   : CHART_DEFAULT_SMALL_SEGMENTS,

// min: isDefined(tile.options?.min)
//   ? Number(tile.options.min)
//   : CHART_DEFAULT_MIN,

// max: isDefined(tile.options?.max)
//   ? Number(tile.options.max)
//   : CHART_DEFAULT_MAX,

// units: tile.options?.units || CHART_DEFAULT_UNITS,

// xScaleMax: isDefined(tile.options?.x_scale_max)
//   ? Number(tile.options.x_scale_max)
//   : CHART_DEFAULT_X_SCALE_MAX,

// yScaleMin: isDefined(tile.options?.y_scale_min)
//   ? Number(tile.options.y_scale_min)
//   : CHART_DEFAULT_Y_SCALE_MIN,

// yScaleMax: isDefined(tile.options?.y_scale_max)
//   ? Number(tile.options.y_scale_max)
//   : CHART_DEFAULT_Y_SCALE_MAX,

// cardColor: tile.options?.card_color || CHART_DEFAULT_CARD_COLOR,

// emptyColor: tile.options?.empty_color || CHART_DEFAULT_EMPTY_COLOR,

// bandColor: tile.options?.band_color || CHART_DEFAULT_BAND_COLOR,

// textColor: tile.options?.text_color || CHART_DEFAULT_TEXT_COLOR,

// formatNumberDataLabel:
//   tile.options?.format_number_data_label ||
//   CHART_DEFAULT_FORMAT_NUMBER_DATA_LABEL,

// formatNumberValue:
//   tile.options?.format_number_value ||
//   CHART_DEFAULT_FORMAT_NUMBER_VALUE,

// formatNumberAxisTick:
//   tile.options?.format_number_axis_tick ||
//   CHART_DEFAULT_FORMAT_AXIS_TICK,

// formatNumberYAxisTick:
//   tile.options?.format_number_y_axis_tick ||
//   CHART_DEFAULT_FORMAT_Y_AXIS_TICK,

// formatNumberXAxisTick:
//   tile.options?.format_number_x_axis_tick ||
//   CHART_DEFAULT_FORMAT_X_AXIS_TICK
