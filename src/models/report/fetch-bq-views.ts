import { api } from '../../barrels/api';
import { genSql } from '../../barrels/gen-sql';
import { interfaces } from '../../barrels/interfaces';

const { forEach } = require('p-iteration');

export async function fetchBqViews(item: {
  dashboards: interfaces.Dashboard[],
  models: interfaces.Model[],
  udfs: interfaces.Udf[],
  weekStart: api.ProjectWeekStartEnum,
  bqProject: string,
  projectId: string,
  structId: string,
}) {

  await forEach(item.dashboards, async (x: interfaces.Dashboard) => {

    // item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    await forEach(x.reports, async (report: interfaces.Report) => {


      // x.reports.forEach(report => {

      let model = item.models.find(m => m.name === report.model);

      let filters: { [filter: string]: string[] } = {};

      if (typeof report.filters !== 'undefined' && report.filters !== null) {
        Object.keys(report.filters).forEach(filter => {
          // remove empty filters
          if (report.filters[filter].length > 0) {
            filters[filter] = report.filters[filter];
          }
        });
      }

      let resItem: interfaces.ItemGenBqViews = await genSql.genBqViews({
        model: model,
        select: report.select,
        sorts: report.sorts,
        timezone: report.timezone,
        limit: report.limit,
        filters: filters,
        weekStart: item.weekStart,
        bqProject: item.bqProject,
        projectId: item.projectId,
        udfs_user: item.udfs,
        structId: item.structId,
      });

      report.filters_fractions = resItem.filters_fractions;
      report.bq_views = resItem.bq_views;

    });
  });

  return item.dashboards;
}
