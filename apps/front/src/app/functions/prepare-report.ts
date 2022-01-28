import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export function prepareReport(item: {
  report?: common.ReportX;
  mconfig: common.MconfigX;
  isForDashboard: boolean;
}) {
  let { report, mconfig, isForDashboard } = item;

  let chart = mconfig.chart;

  let defaultFilters: any = {};

  if (common.isDefined(mconfig.filters) && mconfig.filters.length > 0) {
    mconfig.filters.forEach(x => {
      let bricks: string[] = [];
      x.fractions.forEach(z => bricks.push(z.brick));
      defaultFilters[x.fieldId] = bricks;
    });
  }

  let listenFilters: { [a: string]: string } = {};

  if (
    isForDashboard === true &&
    common.isDefined(report) &&
    common.isDefined(report.listen) &&
    Object.keys(report.listen).length > 0
  ) {
    Object.keys(report.listen).forEach(x => {
      let dashboardFieldName = report.listen[x];

      if (common.isDefined(listenFilters[dashboardFieldName])) {
        listenFilters[dashboardFieldName].concat(`, ${x}`);
      } else {
        listenFilters[dashboardFieldName] = x;
      }
    });

    Object.keys(defaultFilters).forEach(z => {
      if (common.isDefined(report.listen[z])) {
        delete defaultFilters[z];
      }
    });
  }

  let rep: any = {
    title: chart.title,
    description: common.isDefined(chart.description)
      ? chart.description
      : undefined,
    model: mconfig.modelId,
    select: mconfig.select,
    sorts: common.isDefined(mconfig.sorts) ? mconfig.sorts : undefined,
    timezone:
      common.isDefined(mconfig.timezone) && mconfig.timezone !== common.UTC
        ? mconfig.timezone
        : undefined,
    limit:
      common.isDefined(mconfig.limit) &&
      mconfig.limit !== Number(common.DEFAULT_LIMIT)
        ? mconfig.limit
        : undefined,
    default_filters:
      Object.keys(defaultFilters).length > 0 ? defaultFilters : undefined,
    listen_filters:
      isForDashboard === true && Object.keys(listenFilters).length > 0
        ? listenFilters
        : undefined,
    type: chart.type,
    data: {
      x_field:
        constants.xFieldChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.xField)
          ? chart.xField
          : undefined,
      y_field:
        constants.yFieldChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.yField)
          ? chart.yField
          : undefined,
      y_fields:
        constants.yFieldsChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.yFields) &&
        chart.yFields.length > 0
          ? chart.yFields
          : undefined,
      hide_columns:
        constants.hideColumnsChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.hideColumns) &&
        chart.hideColumns.length > 0
          ? chart.hideColumns
          : undefined,
      multi_field:
        constants.multiFieldChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.multiField)
          ? chart.multiField
          : undefined,
      value_field:
        constants.valueFieldChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.valueField)
          ? chart.valueField
          : undefined,
      previous_value_field:
        constants.previousValueFieldChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.previousValueField)
          ? chart.previousValueField
          : undefined
    },
    axis: {
      x_axis_label:
        constants.xAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.xAxisLabel !== common.CHART_DEFAULT_X_AXIS_LABEL &&
        common.isDefined(chart.xAxisLabel)
          ? chart.xAxisLabel
          : undefined,
      y_axis_label:
        constants.yAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.yAxisLabel !== common.CHART_DEFAULT_Y_AXIS_LABEL &&
        common.isDefined(chart.yAxisLabel)
          ? chart.yAxisLabel
          : undefined,
      show_x_axis_label:
        constants.showXAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showXAxisLabel !== common.CHART_DEFAULT_SHOW_X_AXIS_LABEL &&
        common.isDefined(chart.showXAxisLabel)
          ? chart.showXAxisLabel
          : undefined,
      show_y_axis_label:
        constants.showYAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showYAxisLabel !== common.CHART_DEFAULT_SHOW_Y_AXIS_LABEL &&
        common.isDefined(chart.showYAxisLabel)
          ? chart.showYAxisLabel
          : undefined,
      x_axis:
        constants.xAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.xAxis !== common.CHART_DEFAULT_X_AXIS &&
        common.isDefined(chart.xAxis)
          ? chart.xAxis
          : undefined,
      y_axis:
        constants.yAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.yAxis !== common.CHART_DEFAULT_Y_AXIS &&
        common.isDefined(chart.yAxis)
          ? chart.yAxis
          : undefined,
      show_axis:
        constants.showAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.showAxis !== common.CHART_DEFAULT_SHOW_AXIS &&
        common.isDefined(chart.showAxis)
          ? chart.showAxis
          : undefined
    },
    options: {
      color_scheme:
        constants.colorSchemeChartTypes.indexOf(chart.type) > -1 &&
        chart.colorScheme !== common.CHART_DEFAULT_COLOR_SCHEME &&
        common.isDefined(chart.colorScheme)
          ? chart.colorScheme
          : undefined,
      scheme_type:
        constants.schemeTypeChartTypes.indexOf(chart.type) > -1 &&
        chart.schemeType !== common.CHART_DEFAULT_SCHEME_TYPE &&
        common.isDefined(chart.schemeType)
          ? chart.schemeType
          : undefined,
      interpolation:
        constants.interpolationChartTypes.indexOf(chart.type) > -1 &&
        chart.interpolation !== common.CHART_DEFAULT_INTERPOLATION &&
        common.isDefined(chart.interpolation)
          ? chart.interpolation
          : undefined,
      card_color:
        constants.cardColorChartTypes.indexOf(chart.type) > -1 &&
        chart.cardColor !== common.CHART_DEFAULT_CARD_COLOR &&
        common.isDefined(chart.cardColor)
          ? chart.cardColor
          : undefined,
      empty_color:
        constants.emptyColorChartTypes.indexOf(chart.type) > -1 &&
        chart.emptyColor !== common.CHART_DEFAULT_EMPTY_COLOR &&
        common.isDefined(chart.emptyColor)
          ? chart.emptyColor
          : undefined,
      band_color:
        constants.bandColorChartTypes.indexOf(chart.type) > -1 &&
        chart.bandColor !== common.CHART_DEFAULT_BAND_COLOR &&
        common.isDefined(chart.bandColor)
          ? chart.bandColor
          : undefined,
      text_color:
        constants.textColorChartTypes.indexOf(chart.type) > -1 &&
        chart.textColor !== common.CHART_DEFAULT_TEXT_COLOR &&
        common.isDefined(chart.textColor)
          ? chart.textColor
          : undefined,
      units:
        constants.unitsChartTypes.indexOf(chart.type) > -1 &&
        chart.units !== common.CHART_DEFAULT_UNITS &&
        common.isDefined(chart.units)
          ? chart.units
          : undefined,
      legend_title:
        constants.legendTitleChartTypes.indexOf(chart.type) > -1 &&
        chart.legendTitle !== common.CHART_DEFAULT_LEGEND_TITLE &&
        common.isDefined(chart.legendTitle)
          ? chart.legendTitle
          : undefined,
      legend:
        constants.legendChartTypes.indexOf(chart.type) > -1 &&
        chart.legend !== common.CHART_DEFAULT_LEGEND &&
        common.isDefined(chart.legend)
          ? chart.legend
          : undefined,
      labels:
        constants.labelsChartTypes.indexOf(chart.type) > -1 &&
        chart.labels !== common.CHART_DEFAULT_LABELS &&
        common.isDefined(chart.labels)
          ? chart.labels
          : undefined,
      show_data_label:
        constants.showDataLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showDataLabel !== common.CHART_DEFAULT_SHOW_DATA_LABEL &&
        common.isDefined(chart.showDataLabel)
          ? chart.showDataLabel
          : undefined,
      format:
        constants.formatChartTypes.indexOf(chart.type) > -1 &&
        chart.format !== common.CHART_DEFAULT_FORMAT &&
        common.isDefined(chart.format)
          ? chart.format
          : undefined,
      tooltip_disabled:
        constants.tooltipDisabledChartTypes.indexOf(chart.type) > -1 &&
        chart.tooltipDisabled !== common.CHART_DEFAULT_TOOLTIP_DISABLED &&
        common.isDefined(chart.tooltipDisabled)
          ? chart.tooltipDisabled
          : undefined,
      round_edges:
        constants.roundEdgesChartTypes.indexOf(chart.type) > -1 &&
        chart.roundEdges !== common.CHART_DEFAULT_ROUND_EDGES &&
        common.isDefined(chart.roundEdges)
          ? chart.roundEdges
          : undefined,
      round_domains:
        constants.roundDomainsChartTypes.indexOf(chart.type) > -1 &&
        chart.roundDomains !== common.CHART_DEFAULT_ROUND_DOMAINS &&
        common.isDefined(chart.roundDomains)
          ? chart.roundDomains
          : undefined,
      show_grid_lines:
        constants.showGridLinesChartTypes.indexOf(chart.type) > -1 &&
        chart.showGridLines !== common.CHART_DEFAULT_SHOW_GRID_LINES &&
        common.isDefined(chart.showGridLines)
          ? chart.showGridLines
          : undefined,
      auto_scale:
        constants.autoScaleChartTypes.indexOf(chart.type) > -1 &&
        chart.autoScale !== common.CHART_DEFAULT_AUTO_SCALE &&
        common.isDefined(chart.autoScale)
          ? chart.autoScale
          : undefined,
      doughnut:
        constants.doughnutChartTypes.indexOf(chart.type) > -1 &&
        chart.doughnut !== common.CHART_DEFAULT_DOUGHNUT &&
        common.isDefined(chart.doughnut)
          ? chart.doughnut
          : undefined,
      explode_slices:
        constants.explodeSlicesChartTypes.indexOf(chart.type) > -1 &&
        chart.explodeSlices !== common.CHART_DEFAULT_EXPLODE_SLICES &&
        common.isDefined(chart.explodeSlices)
          ? chart.explodeSlices
          : undefined,
      gradient:
        constants.gradientChartTypes.indexOf(chart.type) > -1 &&
        chart.gradient !== common.CHART_DEFAULT_GRADIENT &&
        common.isDefined(chart.gradient)
          ? chart.gradient
          : undefined,
      animations:
        constants.animationsChartTypes.indexOf(chart.type) > -1 &&
        chart.animations !== common.CHART_DEFAULT_ANIMATIONS &&
        common.isDefined(chart.animations)
          ? chart.animations
          : undefined,
      page_size:
        constants.pageSizeChartTypes.indexOf(chart.type) > -1 &&
        chart.pageSize !== common.CHART_DEFAULT_PAGE_SIZE &&
        common.isDefined(chart.pageSize)
          ? chart.pageSize
          : undefined,
      arc_width:
        constants.arcWidthChartTypes.indexOf(chart.type) > -1 &&
        chart.arcWidth !== common.CHART_DEFAULT_ARC_WIDTH &&
        common.isDefined(chart.arcWidth)
          ? chart.arcWidth
          : undefined,
      bar_padding:
        constants.barPaddingChartTypes.indexOf(chart.type) > -1 &&
        chart.barPadding !== common.CHART_DEFAULT_BAR_PADDING &&
        common.isDefined(chart.barPadding)
          ? chart.barPadding
          : undefined,
      group_padding:
        constants.groupPaddingChartTypes.indexOf(chart.type) > -1 &&
        chart.groupPadding !== common.CHART_DEFAULT_GROUP_PADDING &&
        common.isDefined(chart.groupPadding)
          ? chart.groupPadding
          : undefined,
      inner_padding:
        constants.innerPaddingChartTypes.indexOf(chart.type) > -1 &&
        chart.innerPadding !== common.CHART_DEFAULT_INNER_PADDING &&
        common.isDefined(chart.innerPadding)
          ? chart.innerPadding
          : undefined,
      angle_span:
        constants.angleSpanChartTypes.indexOf(chart.type) > -1 &&
        chart.angleSpan !== common.CHART_DEFAULT_ANGLE_SPAN &&
        common.isDefined(chart.angleSpan)
          ? chart.angleSpan
          : undefined,
      start_angle:
        constants.startAngleChartTypes.indexOf(chart.type) > -1 &&
        chart.startAngle !== common.CHART_DEFAULT_START_ANGLE &&
        common.isDefined(chart.startAngle)
          ? chart.startAngle
          : undefined,
      big_segments:
        constants.bigSegmentsChartTypes.indexOf(chart.type) > -1 &&
        chart.bigSegments !== common.CHART_DEFAULT_BIG_SEGMENTS &&
        common.isDefined(chart.bigSegments)
          ? chart.bigSegments
          : undefined,
      small_segments:
        constants.smallSegmentsChartTypes.indexOf(chart.type) > -1 &&
        chart.smallSegments !== common.CHART_DEFAULT_SMALL_SEGMENTS &&
        common.isDefined(chart.smallSegments)
          ? chart.smallSegments
          : undefined,
      min:
        constants.minChartTypes.indexOf(chart.type) > -1 &&
        chart.min !== common.CHART_DEFAULT_MIN &&
        common.isDefined(chart.min)
          ? chart.min
          : undefined,
      max:
        constants.maxChartTypes.indexOf(chart.type) > -1 &&
        chart.max !== common.CHART_DEFAULT_MAX &&
        common.isDefined(chart.max)
          ? chart.max
          : undefined,

      y_scale_min:
        constants.yScaleMinChartTypes.indexOf(chart.type) > -1 &&
        chart.yScaleMin !== common.CHART_DEFAULT_Y_SCALE_MIN &&
        common.isDefined(chart.yScaleMin)
          ? chart.yScaleMin
          : undefined,
      y_scale_max:
        constants.yScaleMaxChartTypes.indexOf(chart.type) > -1 &&
        chart.yScaleMax !== common.CHART_DEFAULT_Y_SCALE_MAX &&
        common.isDefined(chart.yScaleMax)
          ? chart.yScaleMax
          : undefined,
      x_scale_max:
        constants.xScaleMaxChartTypes.indexOf(chart.type) > -1 &&
        chart.xScaleMax !== common.CHART_DEFAULT_X_SCALE_MAX &&
        common.isDefined(chart.xScaleMax)
          ? chart.xScaleMax
          : undefined,

      format_number_data_label:
        constants.formatNumberDataLabelChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.formatNumberDataLabel)
          ? chart.formatNumberDataLabel
          : undefined,

      format_number_value:
        constants.formatNumberValueChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.formatNumberValue)
          ? chart.formatNumberValue
          : undefined,

      format_number_axis_tick:
        constants.formatNumberAxisTickChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.formatNumberAxisTick)
          ? chart.formatNumberAxisTick
          : undefined,

      format_number_y_axis_tick:
        constants.formatNumberYAxisTickChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.formatNumberYAxisTick)
          ? chart.formatNumberYAxisTick
          : undefined,

      format_number_x_axis_tick:
        constants.formatNumberXAxisTickChartTypes.indexOf(chart.type) > -1 &&
        common.isDefined(chart.formatNumberXAxisTick)
          ? chart.formatNumberXAxisTick
          : undefined

      // timeline:
      //   constants.timelineChartTypes.indexOf(chart.type) > -1 &&
      //   chart.timeline !== common.CHART_DEFAULT_TIMELINE &&
      //   common.isDefined()
      //     ? chart.timeline
      //     : undefined,
      // range_fill_opacity:
      //   constants.rangeFillOpacityChartTypes.indexOf(chart.type) > -1 &&
      //   chart.rangeFillOpacity !== common.CHART_DEFAULT_RANGE_FILL_OPACITY &&
      //   common.isDefined()
      //     ? chart.rangeFillOpacity
      //     : undefined,
    },
    tile: {}
  };

  if (isForDashboard === true) {
    rep.tile = {
      tile_width:
        // report.tileWidth !== common.REPORT_DEFAULT_TILE_WIDTH &&
        common.isDefined(report.tileWidth) ? report.tileWidth : undefined,

      tile_height:
        // report.tileHeight !== common.REPORT_DEFAULT_TILE_HEIGHT &&
        common.isDefined(report.tileHeight) ? report.tileHeight : undefined,

      tile_x:
        // report.tileX !== common.REPORT_DEFAULT_TILE_X &&
        common.isDefined(report.tileX) ? report.tileX : undefined,

      tile_y:
        // report.tileY !== common.REPORT_DEFAULT_TILE_Y &&
        common.isDefined(report.tileY) ? report.tileY : undefined
    };
  }

  let keepData = false;
  Object.keys(rep.data).forEach((x: any) => {
    if (common.isDefined((<any>rep.data)[x])) {
      keepData = true;
    }
  });
  if (keepData === false) {
    delete rep.data;
  }

  let keepAxis = false;
  Object.keys(rep.axis).forEach((x: any) => {
    if (common.isDefined((<any>rep.axis)[x])) {
      keepAxis = true;
    }
  });
  if (keepAxis === false) {
    delete rep.axis;
  }

  let keepOptions = false;
  Object.keys(rep.options).forEach((x: any) => {
    if (common.isDefined((<any>rep.options)[x])) {
      keepOptions = true;
    }
  });
  if (keepOptions === false) {
    delete rep.options;
  }

  let keepTile = false;
  Object.keys(rep.tile).forEach((x: any) => {
    if (common.isDefined((<any>rep.tile)[x])) {
      keepTile = true;
    }
  });
  if (keepTile === false) {
    delete rep.tile;
  }

  return rep;
}
