import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapReports(item: {
  structId: string;
  orgId: string;
  projectId: string;
  reports: interfaces.Report[];
  models: interfaces.Model[];
}) {
  let { structId, orgId, projectId, models, reports } = item;

  let apiReports: common.Report[] = [];
  let mconfigs: common.Mconfig[] = [];
  let queries: common.Query[] = [];

  reports.forEach(report => {
    let filters: common.Filter[] = [];

    Object.keys(report.filtersFractions).forEach(fieldId => {
      filters.push({
        fieldId: fieldId,
        fractions: report.filtersFractions[fieldId] || []
      });
    });

    let chart: common.Chart = {
      isValid: true,
      title: report.title,
      description: report.description,
      type: report.type,

      // data
      xField: report.data?.x_field,
      yField: report.data?.y_field,
      yFields: report.data?.y_fields || [],
      hideColumns: report.data?.hide_columns || [],
      multiField: report.data?.multi_field,
      valueField: report.data?.value_field,
      previousValueField: report.data?.previous_value_field,

      // axis
      xAxis: common.isDefined(report.axis?.x_axis)
        ? helper.toBooleanFromLowercaseString(report.axis?.x_axis)
        : common.CHART_DEFAULT_X_AXIS,

      showXAxisLabel: common.isDefined(report.axis?.show_x_axis_label)
        ? helper.toBooleanFromLowercaseString(report.axis?.show_x_axis_label)
        : common.CHART_DEFAULT_SHOW_X_AXIS_LABEL,

      xAxisLabel:
        report.axis?.x_axis_label || common.CHART_DEFAULT_X_AXIS_LABEL,

      yAxis: common.isDefined(report.axis?.y_axis)
        ? helper.toBooleanFromLowercaseString(report.axis?.y_axis)
        : common.CHART_DEFAULT_Y_AXIS,

      showYAxisLabel: common.isDefined(report.axis?.show_y_axis_label)
        ? helper.toBooleanFromLowercaseString(report.axis?.show_y_axis_label)
        : common.CHART_DEFAULT_SHOW_Y_AXIS_LABEL,

      yAxisLabel:
        report.axis?.y_axis_label || common.CHART_DEFAULT_Y_AXIS_LABEL,

      showAxis: common.isDefined(report.axis?.show_axis)
        ? helper.toBooleanFromLowercaseString(report.axis?.show_axis)
        : common.CHART_DEFAULT_SHOW_AXIS,

      // options
      animations: common.isDefined(report.options?.animations)
        ? helper.toBooleanFromLowercaseString(report.options?.animations)
        : common.CHART_DEFAULT_ANIMATIONS,

      showDataLabel: common.isDefined(report.options?.show_data_label)
        ? helper.toBooleanFromLowercaseString(report.options?.show_data_label)
        : common.CHART_DEFAULT_SHOW_DATA_LABEL,

      format: common.isDefined(report.options?.format)
        ? helper.toBooleanFromLowercaseString(report.options?.format)
        : common.CHART_DEFAULT_FORMAT,

      gradient: common.isDefined(report.options?.gradient)
        ? helper.toBooleanFromLowercaseString(report.options?.gradient)
        : common.CHART_DEFAULT_GRADIENT,

      legend: common.isDefined(report.options?.legend)
        ? helper.toBooleanFromLowercaseString(report.options?.legend)
        : common.CHART_DEFAULT_LEGEND,

      legendTitle:
        report.options?.legend_title || common.CHART_DEFAULT_LEGEND_TITLE,

      tooltipDisabled: common.isDefined(report.options?.tooltip_disabled)
        ? helper.toBooleanFromLowercaseString(report.options?.tooltip_disabled)
        : common.CHART_DEFAULT_TOOLTIP_DISABLED,

      roundEdges: common.isDefined(report.options?.round_edges)
        ? helper.toBooleanFromLowercaseString(report.options?.round_edges)
        : common.CHART_DEFAULT_ROUND_EDGES,

      roundDomains: common.isDefined(report.options?.round_domains)
        ? helper.toBooleanFromLowercaseString(report.options?.round_domains)
        : common.CHART_DEFAULT_ROUND_DOMAINS,

      showGridLines: common.isDefined(report.options?.show_grid_lines)
        ? helper.toBooleanFromLowercaseString(report.options?.show_grid_lines)
        : common.CHART_DEFAULT_SHOW_GRID_LINES,

      timeline: common.isDefined(report.options?.timeline)
        ? helper.toBooleanFromLowercaseString(report.options?.timeline)
        : common.CHART_DEFAULT_TIMELINE,

      interpolation:
        report.options?.interpolation || common.CHART_DEFAULT_INTERPOLATION,

      autoScale: common.isDefined(report.options?.auto_scale)
        ? helper.toBooleanFromLowercaseString(report.options?.auto_scale)
        : common.CHART_DEFAULT_AUTO_SCALE,

      doughnut: common.isDefined(report.options?.doughnut)
        ? helper.toBooleanFromLowercaseString(report.options?.doughnut)
        : common.CHART_DEFAULT_DOUGHNUT,

      explodeSlices: common.isDefined(report.options?.explode_slices)
        ? helper.toBooleanFromLowercaseString(report.options?.explode_slices)
        : common.CHART_DEFAULT_EXPLODE_SLICES,

      labels: common.isDefined(report.options?.labels)
        ? helper.toBooleanFromLowercaseString(report.options?.labels)
        : common.CHART_DEFAULT_LABELS,

      colorScheme:
        report.options?.color_scheme || common.CHART_DEFAULT_COLOR_SCHEME,

      schemeType:
        report.options?.scheme_type || common.CHART_DEFAULT_SCHEME_TYPE,

      pageSize: common.isDefined(report.options?.page_size)
        ? Number(report.options.page_size)
        : common.CHART_DEFAULT_PAGE_SIZE,

      arcWidth: common.isDefined(report.options?.arc_width)
        ? Number(report.options.arc_width)
        : common.CHART_DEFAULT_ARC_WIDTH,

      barPadding: common.isDefined(report.options?.bar_padding)
        ? Number(report.options.bar_padding)
        : common.CHART_DEFAULT_BAR_PADDING,

      groupPadding: common.isDefined(report.options?.group_padding)
        ? Number(report.options.group_padding)
        : common.CHART_DEFAULT_GROUP_PADDING,

      innerPadding: common.isDefined(report.options?.inner_padding)
        ? Number(report.options.inner_padding)
        : common.CHART_DEFAULT_INNER_PADDING,

      rangeFillOpacity: common.isDefined(report.options?.range_fill_opacity)
        ? Number(report.options.range_fill_opacity)
        : common.CHART_DEFAULT_RANGE_FILL_OPACITY,

      angleSpan: common.isDefined(report.options?.angle_span)
        ? Number(report.options.angle_span)
        : common.CHART_DEFAULT_ANGLE_SPAN,

      startAngle: common.isDefined(report.options?.start_angle)
        ? Number(report.options.start_angle)
        : common.CHART_DEFAULT_START_ANGLE,

      bigSegments: common.isDefined(report.options?.big_segments)
        ? Number(report.options.big_segments)
        : common.CHART_DEFAULT_BIG_SEGMENTS,

      smallSegments: common.isDefined(report.options?.small_segments)
        ? Number(report.options.small_segments)
        : common.CHART_DEFAULT_SMALL_SEGMENTS,

      min: common.isDefined(report.options?.min)
        ? Number(report.options.min)
        : common.CHART_DEFAULT_MIN,

      max: common.isDefined(report.options?.max)
        ? Number(report.options.max)
        : common.CHART_DEFAULT_MAX,

      units: report.options?.units || common.CHART_DEFAULT_UNITS,

      xScaleMax: common.isDefined(report.options?.x_scale_max)
        ? Number(report.options.x_scale_max)
        : common.CHART_DEFAULT_X_SCALE_MAX,

      yScaleMin: common.isDefined(report.options?.y_scale_min)
        ? Number(report.options.y_scale_min)
        : common.CHART_DEFAULT_Y_SCALE_MIN,

      yScaleMax: common.isDefined(report.options?.y_scale_max)
        ? Number(report.options.y_scale_max)
        : common.CHART_DEFAULT_Y_SCALE_MAX,

      cardColor: report.options?.card_color || common.CHART_DEFAULT_CARD_COLOR,

      emptyColor:
        report.options?.empty_color || common.CHART_DEFAULT_EMPTY_COLOR,

      bandColor: report.options?.band_color || common.CHART_DEFAULT_BAND_COLOR,

      textColor: report.options?.text_color || common.CHART_DEFAULT_TEXT_COLOR,

      formatNumberDataLabel:
        report.options?.format_number_data_label ||
        common.CHART_DEFAULT_FORMAT_NUMBER_DATA_LABEL,

      formatNumberValue:
        report.options?.format_number_value ||
        common.CHART_DEFAULT_FORMAT_NUMBER_VALUE,

      formatNumberAxisTick:
        report.options?.format_number_axis_tick ||
        common.CHART_DEFAULT_FORMAT_AXIS_TICK,

      formatNumberYAxisTick:
        report.options?.format_number_y_axis_tick ||
        common.CHART_DEFAULT_FORMAT_Y_AXIS_TICK,

      formatNumberXAxisTick:
        report.options?.format_number_x_axis_tick ||
        common.CHART_DEFAULT_FORMAT_X_AXIS_TICK
    };

    let model = models.find(m => m.name === report.model);

    let queryId = helper.makeQueryId({
      sql: report.sql,
      orgId: orgId,
      projectId: projectId,
      connection: model.connection
    });

    let query: common.Query = {
      queryId: queryId,
      projectId: projectId,
      connectionId: model.connection.connectionId,
      connectionType: model.connection.type,
      sql: report.sql.join('\n'),
      status: common.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: undefined,
      lastCancelTs: undefined,
      lastCompleteTs: undefined,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: undefined,
      data: undefined,
      queryJobId: undefined,
      bigqueryQueryJobId: undefined,
      bigqueryConsecutiveErrorsGetJob: 0,
      bigqueryConsecutiveErrorsGetResults: 0,
      serverTs: 1
    };

    let mconfigId = common.makeId();

    let mconfig: common.Mconfig = {
      structId: structId,
      mconfigId: mconfigId,
      queryId: queryId,
      modelId: report.model,
      modelLabel: model.label,
      select: report.select,
      sortings: report.sortingsAry.map(s => ({
        fieldId: s.fieldId,
        desc: s.desc
      })),
      sorts: report.sorts,
      timezone: report.timezone,
      limit: report.limit ? Number(report.limit) : undefined,
      filters: filters,
      chart: chart,
      temp: false,
      serverTs: 1
    };

    mconfigs.push(mconfig);
    queries.push(query);
    apiReports.push({
      modelId: model.name,
      modelLabel: model.label,
      mconfigId: mconfigId,
      timezone: report.timezone,
      queryId: queryId,
      listen: report.listen,
      title: chart.title,
      tileWidth: common.isDefined(report.tile?.tile_width)
        ? Number(report.tile.tile_width)
        : common.REPORT_DEFAULT_TILE_WIDTH,
      tileHeight: common.isDefined(report.tile?.tile_height)
        ? Number(report.tile.tile_height)
        : common.REPORT_DEFAULT_TILE_HEIGHT,
      tileX: common.isDefined(report.tile?.tile_x)
        ? Number(report.tile.tile_x)
        : common.REPORT_DEFAULT_TILE_X,
      tileY: common.isDefined(report.tile?.tile_y)
        ? Number(report.tile.tile_y)
        : common.REPORT_DEFAULT_TILE_Y
    });
  });

  return {
    apiReports: apiReports,
    mconfigs: mconfigs,
    queries: queries
  };
}
