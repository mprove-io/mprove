import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapReports(item: {
  structId: string;
  organizationId: string;
  projectId: string;
  reports: interfaces.Report[];
  models: interfaces.Model[];
}) {
  let { structId, organizationId, projectId, models, reports } = item;

  let apiReports: apiToBlockml.Report[] = [];
  let mconfigs: apiToBlockml.Mconfig[] = [];
  let queries: apiToBlockml.Query[] = [];

  reports.forEach(report => {
    let filters: apiToBlockml.Filter[] = [];

    Object.keys(report.filtersFractions).forEach(fieldId => {
      filters.push({
        fieldId: fieldId,
        fractions: report.filtersFractions[fieldId] || []
      });
    });

    let chartId = common.makeId();

    let chart: apiToBlockml.Chart = {
      chartId: chartId,
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
      xAxis: helper.toBoolean(report.axis?.x_axis),
      showXAxisLabel: helper.toBoolean(report.axis?.show_x_axis_label),
      xAxisLabel: report.axis?.x_axis_label || constants.X_AXIS_LABEL,

      yAxis: helper.toBoolean(report.axis?.y_axis),
      showYAxisLabel: helper.toBoolean(report.axis?.show_y_axis_label),
      yAxisLabel: report.axis?.y_axis_label || constants.Y_AXIS_LABEL,

      showAxis: helper.toBoolean(report.axis?.show_axis),

      // options
      animations: helper.toBoolean(report.options?.animations),
      gradient: helper.toBoolean(report.options?.gradient),
      legend: helper.toBoolean(report.options?.legend),

      legendTitle: report.options?.legend_title || constants.LEGEND,

      tooltipDisabled: helper.toBoolean(report.options?.tooltip_disabled),
      roundEdges: helper.toBoolean(report.options?.round_edges),
      roundDomains: helper.toBoolean(report.options?.round_domains),
      showGridLines: helper.toBoolean(report.options?.show_grid_lines),
      timeline: helper.toBoolean(report.options?.timeline),

      interpolation:
        report.options?.interpolation ||
        apiToBlockml.ChartInterpolationEnum.Linear,

      autoScale: helper.toBoolean(report.options?.auto_scale),
      doughnut: helper.toBoolean(report.options?.doughnut),
      explodeSlices: helper.toBoolean(report.options?.explode_slices),
      labels: helper.toBoolean(report.options?.labels),

      colorScheme:
        report.options?.color_scheme || apiToBlockml.ChartColorSchemeEnum.Cool,

      schemeType:
        report.options?.scheme_type || apiToBlockml.ChartSchemeTypeEnum.Ordinal,

      pageSize: common.isDefined(report.options?.page_size)
        ? Number(report.options.page_size)
        : 500,

      arcWidth: common.isDefined(report.options?.arc_width)
        ? Number(report.options.arc_width)
        : 0.25,

      barPadding: common.isDefined(report.options?.bar_padding)
        ? Number(report.options.bar_padding)
        : 8,

      groupPadding: common.isDefined(report.options?.group_padding)
        ? Number(report.options.group_padding)
        : 16,

      innerPadding: common.isDefined(report.options?.inner_padding)
        ? Number(report.options.inner_padding)
        : 8,

      rangeFillOpacity: common.isDefined(report.options?.range_fill_opacity)
        ? Number(report.options.range_fill_opacity)
        : 0.15,

      angleSpan: common.isDefined(report.options?.angle_span)
        ? Number(report.options.angle_span)
        : 240,

      startAngle: common.isDefined(report.options?.start_angle)
        ? Number(report.options.start_angle)
        : -120,

      bigSegments: common.isDefined(report.options?.big_segments)
        ? Number(report.options.big_segments)
        : 10,

      smallSegments: common.isDefined(report.options?.small_segments)
        ? Number(report.options.small_segments)
        : 5,

      min: common.isDefined(report.options?.min)
        ? Number(report.options.min)
        : 0,

      max: common.isDefined(report.options?.max)
        ? Number(report.options.max)
        : 100,

      units: report.options?.units,

      yScaleMin: common.isDefined(report.options?.y_scale_min)
        ? Number(report.options.y_scale_min)
        : undefined,

      xScaleMax: common.isDefined(report.options?.x_scale_max)
        ? Number(report.options.x_scale_max)
        : undefined,

      yScaleMax: common.isDefined(report.options?.y_scale_max)
        ? Number(report.options.y_scale_max)
        : undefined,

      bandColor: report.options?.band_color,
      cardColor: report.options?.card_color,
      textColor: report.options?.text_color,
      emptyColor: report.options?.empty_color || constants.RGBA_0,

      // tile
      tileWidth: report.tile?.tile_width || apiToBlockml.ChartTileWidthEnum._6,
      tileHeight:
        report.tile?.tile_height || apiToBlockml.ChartTileHeightEnum._500,
      viewSize: report.tile?.view_size || apiToBlockml.ChartViewSizeEnum.Auto,
      viewWidth: common.isDefined(report.tile?.view_width)
        ? Number(report.tile.view_width)
        : 600,
      viewHeight: common.isDefined(report.tile?.view_height)
        ? Number(report.tile.view_height)
        : 200
    };

    let model = models.find(m => m.name === report.model);

    let queryId = helper.makeQueryId({
      sql: report.sql,
      organizationId: organizationId,
      projectId: projectId,
      connection: model.connection
    });

    let query: apiToBlockml.Query = {
      queryId: queryId,
      projectId: projectId,
      connectionId: model.connection.connectionId,
      sql: report.sql.join('\n'),
      status: common.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: 1,
      lastCancelTs: 1,
      lastCompleteTs: 1,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: 1,
      data: undefined,
      serverTs: 1
    };

    let mconfigId = common.makeId();

    let mconfig: apiToBlockml.Mconfig = {
      structId: structId,
      mconfigId: mconfigId,
      queryId: queryId,
      modelId: report.model,
      select: report.select,
      sortings: report.sortingsAry.map(s => ({
        fieldId: s.fieldId,
        desc: s.desc
      })),
      sorts: report.sorts,
      timezone: report.timezone,
      limit: report.limit ? Number(report.limit) : undefined,
      filters: filters,
      charts: [chart],
      temp: false,
      serverTs: 1
    };

    mconfigs.push(mconfig);
    queries.push(query);
    apiReports.push({
      mconfigId: mconfigId,
      queryId: queryId
    });
  });

  return {
    apiReports: apiReports,
    mconfigs: mconfigs,
    queries: queries
  };
}
