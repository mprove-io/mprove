import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';

export function wrapTiles(item: {
  structId: string;
  orgId: string;
  projectId: string;
  envId: string;
  tiles: common.FilePartTile[];
  models: common.FileModel[];
  timezone: string;
}) {
  let { structId, orgId, projectId, models, tiles, envId, timezone } = item;

  let apiTiles: common.Tile[] = [];
  let mconfigs: common.Mconfig[] = [];
  let queries: common.Query[] = [];

  tiles.forEach(tile => {
    let filters: common.Filter[] = [];

    Object.keys(tile.filtersFractions).forEach(fieldId => {
      filters.push({
        fieldId: fieldId,
        fractions: tile.filtersFractions[fieldId] || []
      });
    });

    let yField = tile.data?.y_field;
    let yFields = tile.data?.y_fields || [];

    let chart: common.MconfigChart = {
      isValid: true,
      title: tile.title,
      description: tile.description,
      type: tile.type,

      // data
      xField: tile.data?.x_field,
      yField: tile.data?.y_field,
      yFields:
        common.isDefined(yField) && yFields.indexOf(yField) > -1
          ? yFields
          : common.isDefined(yField)
          ? [...yFields, yField]
          : yFields,
      hideColumns: tile.data?.hide_columns || [],
      multiField: tile.data?.multi_field,

      // axis
      // xAxis: common.isDefined(tile.axis?.x_axis)
      //   ? helper.toBooleanFromLowercaseString(tile.axis?.x_axis)
      //   : common.CHART_DEFAULT_X_AXIS,

      // showXAxisLabel: common.isDefined(tile.axis?.show_x_axis_label)
      //   ? helper.toBooleanFromLowercaseString(tile.axis?.show_x_axis_label)
      //   : common.CHART_DEFAULT_SHOW_X_AXIS_LABEL,

      // xAxisLabel: tile.axis?.x_axis_label || common.CHART_DEFAULT_X_AXIS_LABEL,

      // yAxis: common.isDefined(tile.axis?.y_axis)
      //   ? helper.toBooleanFromLowercaseString(tile.axis?.y_axis)
      //   : common.CHART_DEFAULT_Y_AXIS,

      // showYAxisLabel: common.isDefined(tile.axis?.show_y_axis_label)
      //   ? helper.toBooleanFromLowercaseString(tile.axis?.show_y_axis_label)
      //   : common.CHART_DEFAULT_SHOW_Y_AXIS_LABEL,

      // yAxisLabel: tile.axis?.y_axis_label || common.CHART_DEFAULT_Y_AXIS_LABEL,

      // showAxis: common.isDefined(tile.axis?.show_axis)
      //   ? helper.toBooleanFromLowercaseString(tile.axis?.show_axis)
      //   : common.CHART_DEFAULT_SHOW_AXIS,

      // options

      format: common.isDefined(tile.options?.format)
        ? helper.toBooleanFromLowercaseString(tile.options?.format)
        : common.DEFAULT_CHART.format,

      pageSize: common.isDefined(tile.options?.page_size)
        ? Number(tile.options.page_size)
        : common.DEFAULT_CHART.pageSize

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
    };

    let model = models.find(m => m.name === tile.model);

    let queryId = helper.makeQueryId({
      sql: tile.sql,
      orgId: orgId,
      projectId: projectId,
      connection: model.connection,
      envId: envId
    });

    let query: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: model.connection.connectionId,
      connectionType: model.connection.type,
      sql: tile.sql.join('\n'),
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
      modelId: tile.model,
      modelLabel: model.label,
      select: tile.select,
      unsafeSelect: tile.unsafeSelect,
      warnSelect: tile.warnSelect,
      joinAggregations: tile.joinAggregations,
      sortings: tile.sortingsAry.map(s => ({
        fieldId: s.fieldId,
        desc: s.desc
      })),
      sorts: tile.sorts,
      timezone: timezone,
      limit: tile.limit ? Number(tile.limit) : undefined,
      filters: filters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      ),
      chart: chart,
      temp: false,
      serverTs: 1
    };

    mconfigs.push(mconfig);
    queries.push(query);
    apiTiles.push({
      modelId: model.name,
      modelLabel: model.label,
      mconfigId: mconfigId,
      queryId: queryId,
      listen: tile.listen,
      title: chart.title,
      plateWidth: common.isDefined(tile.plate?.plate_width)
        ? Number(tile.plate.plate_width)
        : common.TILE_DEFAULT_PLATE_WIDTH,
      plateHeight: common.isDefined(tile.plate?.plate_height)
        ? Number(tile.plate.plate_height)
        : common.TILE_DEFAULT_PLATE_HEIGHT,
      plateX: common.isDefined(tile.plate?.plate_x)
        ? Number(tile.plate.plate_x)
        : common.TILE_DEFAULT_PLATE_X,
      plateY: common.isDefined(tile.plate?.plate_y)
        ? Number(tile.plate.plate_y)
        : common.TILE_DEFAULT_PLATE_Y
    });
  });

  return {
    apiTiles: apiTiles,
    mconfigs: mconfigs,
    queries: queries
  };
}
