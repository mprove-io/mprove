import { api } from '../../barrels/api';
import { genSql } from '../../barrels/gen-sql';
import { interfaces } from '../../barrels/interfaces';

const { forEach } = require('p-iteration');

export async function bqViewsOnTheFly(item: {
  dashboard: interfaces.Dashboard;
  models: interfaces.Model[];
  dashboardFilters: { [s: string]: string[] };
  weekStart: api.ProjectWeekStartEnum;
  bqProject: string;
  projectId: string;
  udfs: interfaces.Udf[];
  structId: string;
}) {

  await forEach(item.dashboard.reports, async (report: interfaces.Report) => {

    // build new report filters
    let filters: { [s: string]: string[] } = {};

    Object.keys(report.default).forEach(defaultFilter => {
      // remove empty filters
      if (report.default[defaultFilter].length > 0) {
        filters[defaultFilter] = report.default[defaultFilter];
      }
    });

    Object.keys(report.listen).forEach(filter => {
      let listen = report.listen[filter];

      // remove empty filters
      if (item.dashboardFilters[listen].length > 0) {
        filters[filter] = item.dashboardFilters[listen];
      }
    });

    // replace report filters
    report.filters = filters;

    let model = item.models.find(m => m.name === report.model);

    let resItem: interfaces.ItemGenBqViews = await genSql.genBqViews({
      structId: item.structId,
      projectId: item.projectId,
      bqProject: item.bqProject,
      weekStart: item.weekStart,
      udfs_user: item.udfs,
      model: model,
      select: report.select,
      sorts: report.sorts,
      timezone: report.timezone,
      limit: report.limit,
      filters: filters
    });

    report.filters_fractions = resItem.filters_fractions;
    report.bq_views = resItem.bq_views;
  });

  return item.dashboard;
}
