import { common } from '~front/barrels/common';

export function prepareReport(mconfig: common.Mconfig) {
  let chart = mconfig.chart;

  let defaultFilters: any;

  if (mconfig.filters && mconfig.filters.length > 0) {
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
    type: chart.type
  };

  return rep;
}
