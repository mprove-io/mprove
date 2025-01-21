import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';

export function wrapMconfigChart(item: {
  title: string;
  description: string;
  type: common.ChartTypeEnum;
  options: common.FileChartOptions;
  data: common.FileChartData;
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

  let xAxis: common.MconfigChartXAxis = {
    scale: common.isDefined(options?.x_axis?.scale)
      ? helper.toBooleanFromLowercaseString(options?.x_axis?.scale)
      : common.DEFAULT_CHART.xAxis.scale
  };

  let yAxis: common.MconfigChartYAxis[] = [];

  if (common.isDefined(options?.y_axis) && options?.y_axis.length > 0) {
    yAxis = options?.y_axis.map(yAxisPart => {
      let yAxisElement = {
        scale: common.isDefined(yAxisPart.scale)
          ? helper.toBooleanFromLowercaseString(yAxisPart.scale)
          : common.DEFAULT_CHART_Y_AXIS.scale
      };

      return yAxisElement;
    });
  } else {
    yAxis = [common.DEFAULT_CHART_Y_AXIS];
  }

  if (yAxis.length === 1) {
    yAxis = [...yAxis, common.DEFAULT_CHART_Y_AXIS];
  }

  let series: common.MconfigChartSeries[] = [];

  let seriesIds =
    isReport === false && common.isDefined(data?.y_fields)
      ? data?.y_fields
      : isReport === true && common.isDefined(rowIdsWithShowChart)
      ? rowIdsWithShowChart
      : [];

  series = seriesIds.map(seriesId => {
    let seriesPart = options?.series?.find(s =>
      isReport === false
        ? s.data_field === seriesId
        : s.data_row_id === seriesId
    );

    let seriesElement: common.MconfigChartSeries = {
      dataField: isReport === false ? seriesId : undefined,
      dataRowId: isReport === true ? seriesId : undefined,
      type: common.isDefined(seriesPart?.type) ? seriesPart.type : type,
      yAxisIndex: common.isDefined(seriesPart?.y_axis_index)
        ? Number(seriesPart.y_axis_index)
        : 0
    };

    return seriesElement;
  });

  let mconfigChart: common.MconfigChart = {
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
    format: common.isDefined(options?.format)
      ? helper.toBooleanFromLowercaseString(options?.format)
      : common.DEFAULT_CHART.format,
    pageSize: common.isDefined(options?.page_size)
      ? Number(options.page_size)
      : common.DEFAULT_CHART.pageSize,
    xAxis: xAxis,
    yAxis: yAxis,
    series: series
  };

  return mconfigChart;
}

// animations: common.isDefined(tile.options?.animations)
//   ? helper.toBooleanFromLowercaseString(tile.options?.animations)
//   : common.CHART_DEFAULT_ANIMATIONS,

// showDataLabel: common.isDefined(tile.options?.show_data_label)
//   ? helper.toBooleanFromLowercaseString(tile.options?.show_data_label)
//   : common.CHART_DEFAULT_SHOW_DATA_LABEL,

// gradient: common.isDefined(tile.options?.gradient)
//   ? helper.toBooleanFromLowercaseString(tile.options?.gradient)
//   : common.CHART_DEFAULT_GRADIENT,

// legend: common.isDefined(tile.options?.legend)
//   ? helper.toBooleanFromLowercaseString(tile.options?.legend)
//   : common.CHART_DEFAULT_LEGEND,

// legendTitle:
//   tile.options?.legend_title || common.CHART_DEFAULT_LEGEND_TITLE,

// tooltipDisabled: common.isDefined(tile.options?.tooltip_disabled)
//   ? helper.toBooleanFromLowercaseString(tile.options?.tooltip_disabled)
//   : common.CHART_DEFAULT_TOOLTIP_DISABLED,

// roundEdges: common.isDefined(tile.options?.round_edges)
//   ? helper.toBooleanFromLowercaseString(tile.options?.round_edges)
//   : common.CHART_DEFAULT_ROUND_EDGES,

// roundDomains: common.isDefined(tile.options?.round_domains)
//   ? helper.toBooleanFromLowercaseString(tile.options?.round_domains)
//   : common.CHART_DEFAULT_ROUND_DOMAINS,

// showGridLines: common.isDefined(tile.options?.show_grid_lines)
//   ? helper.toBooleanFromLowercaseString(tile.options?.show_grid_lines)
//   : common.CHART_DEFAULT_SHOW_GRID_LINES,

// timeline: common.isDefined(tile.options?.timeline)
//   ? helper.toBooleanFromLowercaseString(tile.options?.timeline)
//   : common.CHART_DEFAULT_TIMELINE,

// interpolation:
//   tile.options?.interpolation || common.CHART_DEFAULT_INTERPOLATION,

// autoScale: common.isDefined(tile.options?.auto_scale)
//   ? helper.toBooleanFromLowercaseString(tile.options?.auto_scale)
//   : common.CHART_DEFAULT_AUTO_SCALE,

// doughnut: common.isDefined(tile.options?.doughnut)
//   ? helper.toBooleanFromLowercaseString(tile.options?.doughnut)
//   : common.CHART_DEFAULT_DOUGHNUT,

// explodeSlices: common.isDefined(tile.options?.explode_slices)
//   ? helper.toBooleanFromLowercaseString(tile.options?.explode_slices)
//   : common.CHART_DEFAULT_EXPLODE_SLICES,

// labels: common.isDefined(tile.options?.labels)
//   ? helper.toBooleanFromLowercaseString(tile.options?.labels)
//   : common.CHART_DEFAULT_LABELS,

// colorScheme:
//   tile.options?.color_scheme || common.CHART_DEFAULT_COLOR_SCHEME,

// schemeType: tile.options?.scheme_type || common.CHART_DEFAULT_SCHEME_TYPE,

// arcWidth: common.isDefined(tile.options?.arc_width)
//   ? Number(tile.options.arc_width)
//   : common.CHART_DEFAULT_ARC_WIDTH,

// barPadding: common.isDefined(tile.options?.bar_padding)
//   ? Number(tile.options.bar_padding)
//   : common.CHART_DEFAULT_BAR_PADDING,

// groupPadding: common.isDefined(tile.options?.group_padding)
//   ? Number(tile.options.group_padding)
//   : common.CHART_DEFAULT_GROUP_PADDING,

// innerPadding: common.isDefined(tile.options?.inner_padding)
//   ? Number(tile.options.inner_padding)
//   : common.CHART_DEFAULT_INNER_PADDING,

// rangeFillOpacity: common.isDefined(tile.options?.range_fill_opacity)
//   ? Number(tile.options.range_fill_opacity)
//   : common.CHART_DEFAULT_RANGE_FILL_OPACITY,

// angleSpan: common.isDefined(tile.options?.angle_span)
//   ? Number(tile.options.angle_span)
//   : common.CHART_DEFAULT_ANGLE_SPAN,

// startAngle: common.isDefined(tile.options?.start_angle)
//   ? Number(tile.options.start_angle)
//   : common.CHART_DEFAULT_START_ANGLE,

// bigSegments: common.isDefined(tile.options?.big_segments)
//   ? Number(tile.options.big_segments)
//   : common.CHART_DEFAULT_BIG_SEGMENTS,

// smallSegments: common.isDefined(tile.options?.small_segments)
//   ? Number(tile.options.small_segments)
//   : common.CHART_DEFAULT_SMALL_SEGMENTS,

// min: common.isDefined(tile.options?.min)
//   ? Number(tile.options.min)
//   : common.CHART_DEFAULT_MIN,

// max: common.isDefined(tile.options?.max)
//   ? Number(tile.options.max)
//   : common.CHART_DEFAULT_MAX,

// units: tile.options?.units || common.CHART_DEFAULT_UNITS,

// xScaleMax: common.isDefined(tile.options?.x_scale_max)
//   ? Number(tile.options.x_scale_max)
//   : common.CHART_DEFAULT_X_SCALE_MAX,

// yScaleMin: common.isDefined(tile.options?.y_scale_min)
//   ? Number(tile.options.y_scale_min)
//   : common.CHART_DEFAULT_Y_SCALE_MIN,

// yScaleMax: common.isDefined(tile.options?.y_scale_max)
//   ? Number(tile.options.y_scale_max)
//   : common.CHART_DEFAULT_Y_SCALE_MAX,

// cardColor: tile.options?.card_color || common.CHART_DEFAULT_CARD_COLOR,

// emptyColor: tile.options?.empty_color || common.CHART_DEFAULT_EMPTY_COLOR,

// bandColor: tile.options?.band_color || common.CHART_DEFAULT_BAND_COLOR,

// textColor: tile.options?.text_color || common.CHART_DEFAULT_TEXT_COLOR,

// formatNumberDataLabel:
//   tile.options?.format_number_data_label ||
//   common.CHART_DEFAULT_FORMAT_NUMBER_DATA_LABEL,

// formatNumberValue:
//   tile.options?.format_number_value ||
//   common.CHART_DEFAULT_FORMAT_NUMBER_VALUE,

// formatNumberAxisTick:
//   tile.options?.format_number_axis_tick ||
//   common.CHART_DEFAULT_FORMAT_AXIS_TICK,

// formatNumberYAxisTick:
//   tile.options?.format_number_y_axis_tick ||
//   common.CHART_DEFAULT_FORMAT_Y_AXIS_TICK,

// formatNumberXAxisTick:
//   tile.options?.format_number_x_axis_tick ||
//   common.CHART_DEFAULT_FORMAT_X_AXIS_TICK
