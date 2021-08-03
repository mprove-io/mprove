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

  return rep;
}
