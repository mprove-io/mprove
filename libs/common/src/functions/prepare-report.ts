import { constants } from '~common/barrels/constants';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { ReportX } from '~common/interfaces/backend/report-x';
import { FilePartReport } from '~common/_index';
import { isDefined } from './is-defined';

export function prepareReport(item: {
  report?: ReportX;
  mconfig: MconfigX;
  isForDashboard: boolean;
  defaultTimezone: string;
  deleteFilterFieldId: string;
  deleteFilterMconfigId: string;
}): FilePartReport {
  let {
    report,
    mconfig,
    isForDashboard,
    defaultTimezone,
    deleteFilterFieldId,
    deleteFilterMconfigId
  } = item;

  let chart = mconfig.chart;

  let defaultFilters: any = {};

  if (isDefined(mconfig.filters) && mconfig.filters.length > 0) {
    mconfig.filters.forEach(x => {
      let bricks: string[] = [];
      x.fractions.forEach(fraction => bricks.push(fraction.brick));

      if (
        mconfig.mconfigId !== deleteFilterMconfigId ||
        x.fieldId !== deleteFilterFieldId
      ) {
        defaultFilters[x.fieldId] = bricks;
      }
    });
  }

  let listenFilters: { [a: string]: string } = {};

  if (
    isForDashboard === true &&
    isDefined(report) &&
    isDefined(report.listen) &&
    Object.keys(report.listen).length > 0
  ) {
    Object.keys(report.listen).forEach(x => {
      if (
        mconfig.mconfigId !== deleteFilterMconfigId ||
        x !== deleteFilterFieldId
      ) {
        let dashboardFieldName = report.listen[x];

        if (isDefined(listenFilters[dashboardFieldName])) {
          listenFilters[dashboardFieldName] = listenFilters[
            dashboardFieldName
          ].concat(`, ${x}`);
        } else {
          listenFilters[dashboardFieldName] = x;
        }
      }
    });

    Object.keys(defaultFilters).forEach(y => {
      if (isDefined(report.listen[y])) {
        delete defaultFilters[y];
      }
    });
  }

  let filePartReport: FilePartReport = {
    title: chart.title,
    description: isDefined(chart.description) ? chart.description : undefined,
    model: mconfig.modelId,
    select: mconfig.select,
    sorts: isDefined(mconfig.sorts) ? mconfig.sorts : undefined,
    timezone:
      isForDashboard === true &&
      isDefined(report) &&
      isDefined(report.timezone) &&
      report.timezone !== defaultTimezone
        ? report.timezone
        : mconfig.timezone !== defaultTimezone
        ? mconfig.timezone
        : undefined,
    limit:
      isDefined(mconfig.limit) &&
      mconfig.limit !== Number(constants.DEFAULT_LIMIT)
        ? <any>mconfig.limit
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
        isDefined(chart.xField)
          ? chart.xField
          : undefined,
      y_field:
        constants.yFieldChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.yField)
          ? chart.yField
          : undefined,
      y_fields:
        constants.yFieldsChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.yFields) &&
        chart.yFields.length > 0
          ? chart.yFields
          : undefined,
      hide_columns:
        constants.hideColumnsChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.hideColumns) &&
        chart.hideColumns.length > 0
          ? chart.hideColumns
          : undefined,
      multi_field:
        constants.multiFieldChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.multiField)
          ? chart.multiField
          : undefined,
      value_field:
        constants.valueFieldChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.valueField)
          ? chart.valueField
          : undefined,
      previous_value_field:
        constants.previousValueFieldChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.previousValueField)
          ? chart.previousValueField
          : undefined
    },
    axis: {
      x_axis_label:
        constants.xAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.xAxisLabel !== constants.CHART_DEFAULT_X_AXIS_LABEL &&
        isDefined(chart.xAxisLabel)
          ? chart.xAxisLabel
          : undefined,
      y_axis_label:
        constants.yAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.yAxisLabel !== constants.CHART_DEFAULT_Y_AXIS_LABEL &&
        isDefined(chart.yAxisLabel)
          ? chart.yAxisLabel
          : undefined,
      show_x_axis_label:
        constants.showXAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showXAxisLabel !== constants.CHART_DEFAULT_SHOW_X_AXIS_LABEL &&
        isDefined(chart.showXAxisLabel)
          ? <any>chart.showXAxisLabel
          : undefined,
      show_y_axis_label:
        constants.showYAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showYAxisLabel !== constants.CHART_DEFAULT_SHOW_Y_AXIS_LABEL &&
        isDefined(chart.showYAxisLabel)
          ? <any>chart.showYAxisLabel
          : undefined,
      x_axis:
        constants.xAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.xAxis !== constants.CHART_DEFAULT_X_AXIS &&
        isDefined(chart.xAxis)
          ? <any>chart.xAxis
          : undefined,
      y_axis:
        constants.yAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.yAxis !== constants.CHART_DEFAULT_Y_AXIS &&
        isDefined(chart.yAxis)
          ? <any>chart.yAxis
          : undefined,
      show_axis:
        constants.showAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.showAxis !== constants.CHART_DEFAULT_SHOW_AXIS &&
        isDefined(chart.showAxis)
          ? <any>chart.showAxis
          : undefined
    },
    options: {
      color_scheme:
        constants.colorSchemeChartTypes.indexOf(chart.type) > -1 &&
        chart.colorScheme !== constants.CHART_DEFAULT_COLOR_SCHEME &&
        isDefined(chart.colorScheme)
          ? chart.colorScheme
          : undefined,
      scheme_type:
        constants.schemeTypeChartTypes.indexOf(chart.type) > -1 &&
        chart.schemeType !== constants.CHART_DEFAULT_SCHEME_TYPE &&
        isDefined(chart.schemeType)
          ? chart.schemeType
          : undefined,
      interpolation:
        constants.interpolationChartTypes.indexOf(chart.type) > -1 &&
        chart.interpolation !== constants.CHART_DEFAULT_INTERPOLATION &&
        isDefined(chart.interpolation)
          ? chart.interpolation
          : undefined,
      card_color:
        constants.cardColorChartTypes.indexOf(chart.type) > -1 &&
        chart.cardColor !== constants.CHART_DEFAULT_CARD_COLOR &&
        isDefined(chart.cardColor)
          ? chart.cardColor
          : undefined,
      empty_color:
        constants.emptyColorChartTypes.indexOf(chart.type) > -1 &&
        chart.emptyColor !== constants.CHART_DEFAULT_EMPTY_COLOR &&
        isDefined(chart.emptyColor)
          ? chart.emptyColor
          : undefined,
      band_color:
        constants.bandColorChartTypes.indexOf(chart.type) > -1 &&
        chart.bandColor !== constants.CHART_DEFAULT_BAND_COLOR &&
        isDefined(chart.bandColor)
          ? chart.bandColor
          : undefined,
      text_color:
        constants.textColorChartTypes.indexOf(chart.type) > -1 &&
        chart.textColor !== constants.CHART_DEFAULT_TEXT_COLOR &&
        isDefined(chart.textColor)
          ? chart.textColor
          : undefined,
      units:
        constants.unitsChartTypes.indexOf(chart.type) > -1 &&
        chart.units !== constants.CHART_DEFAULT_UNITS &&
        isDefined(chart.units)
          ? chart.units
          : undefined,
      legend_title:
        constants.legendTitleChartTypes.indexOf(chart.type) > -1 &&
        chart.legendTitle !== constants.CHART_DEFAULT_LEGEND_TITLE &&
        isDefined(chart.legendTitle)
          ? chart.legendTitle
          : undefined,
      legend:
        constants.legendChartTypes.indexOf(chart.type) > -1 &&
        chart.legend !== constants.CHART_DEFAULT_LEGEND &&
        isDefined(chart.legend)
          ? <any>chart.legend
          : undefined,
      labels:
        constants.labelsChartTypes.indexOf(chart.type) > -1 &&
        chart.labels !== constants.CHART_DEFAULT_LABELS &&
        isDefined(chart.labels)
          ? <any>chart.labels
          : undefined,
      show_data_label:
        constants.showDataLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showDataLabel !== constants.CHART_DEFAULT_SHOW_DATA_LABEL &&
        isDefined(chart.showDataLabel)
          ? <any>chart.showDataLabel
          : undefined,
      format:
        constants.formatChartTypes.indexOf(chart.type) > -1 &&
        chart.format !== constants.CHART_DEFAULT_FORMAT &&
        isDefined(chart.format)
          ? <any>chart.format
          : undefined,
      tooltip_disabled:
        constants.tooltipDisabledChartTypes.indexOf(chart.type) > -1 &&
        chart.tooltipDisabled !== constants.CHART_DEFAULT_TOOLTIP_DISABLED &&
        isDefined(chart.tooltipDisabled)
          ? <any>chart.tooltipDisabled
          : undefined,
      round_edges:
        constants.roundEdgesChartTypes.indexOf(chart.type) > -1 &&
        chart.roundEdges !== constants.CHART_DEFAULT_ROUND_EDGES &&
        isDefined(chart.roundEdges)
          ? <any>chart.roundEdges
          : undefined,
      round_domains:
        constants.roundDomainsChartTypes.indexOf(chart.type) > -1 &&
        chart.roundDomains !== constants.CHART_DEFAULT_ROUND_DOMAINS &&
        isDefined(chart.roundDomains)
          ? <any>chart.roundDomains
          : undefined,
      show_grid_lines:
        constants.showGridLinesChartTypes.indexOf(chart.type) > -1 &&
        chart.showGridLines !== constants.CHART_DEFAULT_SHOW_GRID_LINES &&
        isDefined(chart.showGridLines)
          ? <any>chart.showGridLines
          : undefined,
      auto_scale:
        constants.autoScaleChartTypes.indexOf(chart.type) > -1 &&
        chart.autoScale !== constants.CHART_DEFAULT_AUTO_SCALE &&
        isDefined(chart.autoScale)
          ? <any>chart.autoScale
          : undefined,
      doughnut:
        constants.doughnutChartTypes.indexOf(chart.type) > -1 &&
        chart.doughnut !== constants.CHART_DEFAULT_DOUGHNUT &&
        isDefined(chart.doughnut)
          ? <any>chart.doughnut
          : undefined,
      explode_slices:
        constants.explodeSlicesChartTypes.indexOf(chart.type) > -1 &&
        chart.explodeSlices !== constants.CHART_DEFAULT_EXPLODE_SLICES &&
        isDefined(chart.explodeSlices)
          ? <any>chart.explodeSlices
          : undefined,
      gradient:
        constants.gradientChartTypes.indexOf(chart.type) > -1 &&
        chart.gradient !== constants.CHART_DEFAULT_GRADIENT &&
        isDefined(chart.gradient)
          ? <any>chart.gradient
          : undefined,
      animations:
        constants.animationsChartTypes.indexOf(chart.type) > -1 &&
        chart.animations !== constants.CHART_DEFAULT_ANIMATIONS &&
        isDefined(chart.animations)
          ? <any>chart.animations
          : undefined,
      page_size:
        constants.pageSizeChartTypes.indexOf(chart.type) > -1 &&
        chart.pageSize !== constants.CHART_DEFAULT_PAGE_SIZE &&
        isDefined(chart.pageSize)
          ? <any>chart.pageSize
          : undefined,
      arc_width:
        constants.arcWidthChartTypes.indexOf(chart.type) > -1 &&
        chart.arcWidth !== constants.CHART_DEFAULT_ARC_WIDTH &&
        isDefined(chart.arcWidth)
          ? <any>chart.arcWidth
          : undefined,
      bar_padding:
        constants.barPaddingChartTypes.indexOf(chart.type) > -1 &&
        chart.barPadding !== constants.CHART_DEFAULT_BAR_PADDING &&
        isDefined(chart.barPadding)
          ? <any>chart.barPadding
          : undefined,
      group_padding:
        constants.groupPaddingChartTypes.indexOf(chart.type) > -1 &&
        chart.groupPadding !== constants.CHART_DEFAULT_GROUP_PADDING &&
        isDefined(chart.groupPadding)
          ? <any>chart.groupPadding
          : undefined,
      inner_padding:
        constants.innerPaddingChartTypes.indexOf(chart.type) > -1 &&
        chart.innerPadding !== constants.CHART_DEFAULT_INNER_PADDING &&
        isDefined(chart.innerPadding)
          ? <any>chart.innerPadding
          : undefined,
      angle_span:
        constants.angleSpanChartTypes.indexOf(chart.type) > -1 &&
        chart.angleSpan !== constants.CHART_DEFAULT_ANGLE_SPAN &&
        isDefined(chart.angleSpan)
          ? <any>chart.angleSpan
          : undefined,
      start_angle:
        constants.startAngleChartTypes.indexOf(chart.type) > -1 &&
        chart.startAngle !== constants.CHART_DEFAULT_START_ANGLE &&
        isDefined(chart.startAngle)
          ? <any>chart.startAngle
          : undefined,
      big_segments:
        constants.bigSegmentsChartTypes.indexOf(chart.type) > -1 &&
        chart.bigSegments !== constants.CHART_DEFAULT_BIG_SEGMENTS &&
        isDefined(chart.bigSegments)
          ? <any>chart.bigSegments
          : undefined,
      small_segments:
        constants.smallSegmentsChartTypes.indexOf(chart.type) > -1 &&
        chart.smallSegments !== constants.CHART_DEFAULT_SMALL_SEGMENTS &&
        isDefined(chart.smallSegments)
          ? <any>chart.smallSegments
          : undefined,
      min:
        constants.minChartTypes.indexOf(chart.type) > -1 &&
        chart.min !== constants.CHART_DEFAULT_MIN &&
        isDefined(chart.min)
          ? <any>chart.min
          : undefined,
      max:
        constants.maxChartTypes.indexOf(chart.type) > -1 &&
        chart.max !== constants.CHART_DEFAULT_MAX &&
        isDefined(chart.max)
          ? <any>chart.max
          : undefined,

      y_scale_min:
        constants.yScaleMinChartTypes.indexOf(chart.type) > -1 &&
        chart.yScaleMin !== constants.CHART_DEFAULT_Y_SCALE_MIN &&
        isDefined(chart.yScaleMin)
          ? <any>chart.yScaleMin
          : undefined,
      y_scale_max:
        constants.yScaleMaxChartTypes.indexOf(chart.type) > -1 &&
        chart.yScaleMax !== constants.CHART_DEFAULT_Y_SCALE_MAX &&
        isDefined(chart.yScaleMax)
          ? <any>chart.yScaleMax
          : undefined,
      x_scale_max:
        constants.xScaleMaxChartTypes.indexOf(chart.type) > -1 &&
        chart.xScaleMax !== constants.CHART_DEFAULT_X_SCALE_MAX &&
        isDefined(chart.xScaleMax)
          ? <any>chart.xScaleMax
          : undefined,

      format_number_data_label:
        constants.formatNumberDataLabelChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.formatNumberDataLabel)
          ? chart.formatNumberDataLabel
          : undefined,

      format_number_value:
        constants.formatNumberValueChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.formatNumberValue)
          ? chart.formatNumberValue
          : undefined,

      format_number_axis_tick:
        constants.formatNumberAxisTickChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.formatNumberAxisTick)
          ? chart.formatNumberAxisTick
          : undefined,

      format_number_y_axis_tick:
        constants.formatNumberYAxisTickChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.formatNumberYAxisTick)
          ? chart.formatNumberYAxisTick
          : undefined,

      format_number_x_axis_tick:
        constants.formatNumberXAxisTickChartTypes.indexOf(chart.type) > -1 &&
        isDefined(chart.formatNumberXAxisTick)
          ? chart.formatNumberXAxisTick
          : undefined

      // timeline:
      //   constants.timelineChartTypes.indexOf(chart.type) > -1 &&
      //   chart.timeline !== constants.CHART_DEFAULT_TIMELINE &&
      //   isDefined()
      //     ? chart.timeline
      //     : undefined,
      // range_fill_opacity:
      //   constants.rangeFillOpacityChartTypes.indexOf(chart.type) > -1 &&
      //   chart.rangeFillOpacity !== constants.CHART_DEFAULT_RANGE_FILL_OPACITY &&
      //   isDefined()
      //     ? chart.rangeFillOpacity
      //     : undefined,
    },
    tile: {}
  };

  if (isForDashboard === true && isDefined(report)) {
    filePartReport.tile = {
      tile_width:
        // report.tileWidth !== constants.REPORT_DEFAULT_TILE_WIDTH &&
        isDefined(report.tileWidth) ? <any>report.tileWidth : undefined,

      tile_height:
        // report.tileHeight !== constants.REPORT_DEFAULT_TILE_HEIGHT &&
        isDefined(report.tileHeight) ? <any>report.tileHeight : undefined,

      tile_x:
        // report.tileX !== constants.REPORT_DEFAULT_TILE_X &&
        isDefined(report.tileX) ? <any>report.tileX : undefined,

      tile_y:
        // report.tileY !== constants.REPORT_DEFAULT_TILE_Y &&
        isDefined(report.tileY) ? <any>report.tileY : undefined
    };
  }

  let keepData = false;
  Object.keys(filePartReport.data).forEach((x: any) => {
    if (isDefined((<any>filePartReport.data)[x])) {
      keepData = true;
    }
  });
  if (keepData === false) {
    delete filePartReport.data;
  }

  let keepAxis = false;
  Object.keys(filePartReport.axis).forEach((x: any) => {
    if (isDefined((<any>filePartReport.axis)[x])) {
      keepAxis = true;
    }
  });
  if (keepAxis === false) {
    delete filePartReport.axis;
  }

  let keepOptions = false;
  Object.keys(filePartReport.options).forEach((x: any) => {
    if (isDefined((<any>filePartReport.options)[x])) {
      keepOptions = true;
    }
  });
  if (keepOptions === false) {
    delete filePartReport.options;
  }

  let keepTile = false;
  Object.keys(filePartReport.tile).forEach((x: any) => {
    if (isDefined((<any>filePartReport.tile)[x])) {
      keepTile = true;
    }
  });
  if (keepTile === false) {
    delete filePartReport.tile;
  }

  return filePartReport;
}
