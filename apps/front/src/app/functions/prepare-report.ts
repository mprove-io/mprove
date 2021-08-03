import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export function prepareReport(mconfig: common.Mconfig) {
  let chart = mconfig.chart;

  let defaultFilters: any;

  if (common.isDefined(mconfig.filters) && mconfig.filters.length > 0) {
    defaultFilters = {};

    mconfig.filters.forEach(x => {
      let bricks: string[] = [];
      x.fractions.forEach(z => bricks.push(z.brick));
      defaultFilters[x.fieldId] = bricks;
    });
  }

  let rep = {
    title: chart.title,
    description: chart.description,
    model: mconfig.modelId,
    select: mconfig.select,
    sorts: mconfig.sorts,
    timezone:
      common.isDefined(mconfig.timezone) && mconfig.timezone !== common.UTC
        ? mconfig.timezone
        : undefined,
    limit:
      common.isDefined(mconfig.limit) &&
      mconfig.limit !== Number(common.DEFAULT_LIMIT)
        ? mconfig.limit
        : undefined,
    default_filters: defaultFilters,
    type: chart.type,
    data: {
      x_field:
        constants.xFieldChartTypes.indexOf(chart.type) > -1
          ? chart.xField
          : undefined,
      y_field:
        constants.yFieldChartTypes.indexOf(chart.type) > -1
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
        constants.multiFieldChartTypes.indexOf(chart.type) > -1
          ? chart.multiField
          : undefined,
      value_field:
        constants.valueFieldChartTypes.indexOf(chart.type) > -1
          ? chart.valueField
          : undefined,
      previous_value_field:
        constants.previousValueFieldChartTypes.indexOf(chart.type) > -1
          ? chart.previousValueField
          : undefined
    },
    axis: {
      x_axis_label:
        constants.xAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.xAxisLabel !== common.CHART_DEFAULT_X_AXIS_LABEL
          ? chart.xAxisLabel
          : undefined,
      y_axis_label:
        constants.yAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.yAxisLabel !== common.CHART_DEFAULT_Y_AXIS_LABEL
          ? chart.yAxisLabel
          : undefined,
      show_x_axis_label:
        constants.showXAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showXAxisLabel !== common.CHART_DEFAULT_SHOW_X_AXIS_LABEL
          ? chart.showXAxisLabel
          : undefined,
      show_y_axis_label:
        constants.showYAxisLabelChartTypes.indexOf(chart.type) > -1 &&
        chart.showYAxisLabel !== common.CHART_DEFAULT_SHOW_Y_AXIS_LABEL
          ? chart.showYAxisLabel
          : undefined,
      x_axis:
        constants.xAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.xAxis !== common.CHART_DEFAULT_X_AXIS
          ? chart.xAxis
          : undefined,
      y_axis:
        constants.yAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.yAxis !== common.CHART_DEFAULT_Y_AXIS
          ? chart.yAxis
          : undefined,
      show_axis:
        constants.showAxisChartTypes.indexOf(chart.type) > -1 &&
        chart.showAxis !== common.CHART_DEFAULT_SHOW_AXIS
          ? chart.showAxis
          : undefined
    },
    tile: {
      tile_width:
        chart.tileWidth !== common.CHART_DEFAULT_TILE_WIDTH
          ? chart.tileWidth
          : undefined,
      tile_height:
        chart.tileHeight !== common.CHART_DEFAULT_TILE_HEIGHT
          ? chart.tileHeight
          : undefined,
      view_size:
        chart.viewSize !== common.CHART_DEFAULT_VIEW_SIZE
          ? chart.viewSize
          : undefined,
      view_width:
        chart.viewWidth !== common.CHART_DEFAULT_VIEW_WIDTH
          ? chart.viewWidth
          : undefined,
      view_height:
        chart.viewHeight !== common.CHART_DEFAULT_VIEW_HEIGHT
          ? chart.viewHeight
          : undefined
    }
  };

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
