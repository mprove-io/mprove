import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

export function wrapReports(item: {
  projectId: string;
  repoId: string;
  structId: string;
  reports: interfaces.Report[];
}) {
  let apiReports: api.Report[] = [];
  let mconfigs: api.Mconfig[] = [];
  let queries: api.Query[] = [];

  item.reports.forEach(report => {
    let filters: api.Filter[] = [];

    Object.keys(report.filtersFractions).forEach(fieldId => {
      filters.push({
        fieldId: fieldId,
        fractions: report.filtersFractions[fieldId] || []
      });
    });

    let mconfigId = helper.makeId();
    let queryId = helper.makeId();
    let chartId = helper.makeId();

    let chart: api.Chart = {
      chartId: chartId,
      isValid: true,
      title: report.title,
      description: report.description,
      type: <any>report.type,

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
        report.options?.interpolation || api.ChartInterpolationEnum.Linear,

      autoScale: helper.toBoolean(report.options?.auto_scale),
      doughnut: helper.toBoolean(report.options?.doughnut),
      explodeSlices: helper.toBoolean(report.options?.explode_slices),
      labels: helper.toBoolean(report.options?.labels),

      colorScheme:
        report.options?.color_scheme || api.ChartColorSchemeEnum.Cool,

      schemeType:
        report.options?.scheme_type || api.ChartSchemeTypeEnum.Ordinal,

      pageSize: helper.isDefined(report.options?.page_size)
        ? Number(report.options.page_size)
        : 500,

      arcWidth: helper.isDefined(report.options?.arc_width)
        ? Number(report.options.arc_width)
        : 0.25,

      barPadding: helper.isDefined(report.options?.bar_padding)
        ? Number(report.options.bar_padding)
        : 8,

      groupPadding: helper.isDefined(report.options?.group_padding)
        ? Number(report.options.group_padding)
        : 16,

      innerPadding: helper.isDefined(report.options?.inner_padding)
        ? Number(report.options.inner_padding)
        : 8,

      rangeFillOpacity: helper.isDefined(report.options?.range_fill_opacity)
        ? Number(report.options.range_fill_opacity)
        : 0.15,

      angleSpan: helper.isDefined(report.options?.angle_span)
        ? Number(report.options.angle_span)
        : 240,

      startAngle: helper.isDefined(report.options?.start_angle)
        ? Number(report.options.start_angle)
        : -120,

      bigSegments: helper.isDefined(report.options?.big_segments)
        ? Number(report.options.big_segments)
        : 10,

      smallSegments: helper.isDefined(report.options?.small_segments)
        ? Number(report.options.small_segments)
        : 5,

      min: helper.isDefined(report.options?.min)
        ? Number(report.options.min)
        : 0,

      max: helper.isDefined(report.options?.max)
        ? Number(report.options.max)
        : 100,

      units: report.options?.units,

      yScaleMin: helper.isDefined(report.options?.y_scale_min)
        ? Number(report.options.y_scale_min)
        : undefined,

      xScaleMax: helper.isDefined(report.options?.x_scale_max)
        ? Number(report.options.x_scale_max)
        : undefined,

      yScaleMax: helper.isDefined(report.options?.y_scale_max)
        ? Number(report.options.y_scale_max)
        : undefined,

      bandColor: report.options?.band_color,
      cardColor: report.options?.card_color,
      textColor: report.options?.text_color,
      emptyColor: report.options?.empty_color || constants.RGBA_0,

      // tile
      tileWidth: report.tile?.tile_width || api.ChartTileWidthEnum._6,
      tileHeight: report.tile?.tile_height || api.ChartTileHeightEnum._500,
      viewSize: report.tile?.view_size || api.ChartViewSizeEnum.Auto,
      viewWidth: helper.isDefined(report.tile?.view_width)
        ? Number(report.tile.view_width)
        : 600,
      viewHeight: helper.isDefined(report.tile?.view_height)
        ? Number(report.tile.view_height)
        : 200
    };

    let mconfig: api.Mconfig = {
      mconfigId: mconfigId,
      queryId: queryId,
      projectId: item.projectId,
      repoId: item.repoId,
      structId: item.structId,
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

    let query: api.Query = {
      queryId: queryId,
      projectId: item.projectId,
      structId: item.structId,
      sql: report.sql,
      status: api.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: 1,
      lastCancelTs: 1,
      lastCompleteTs: 1,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: 1,
      data: undefined,
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
