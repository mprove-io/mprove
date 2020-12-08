import { forEachSeries } from 'p-iteration';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSpecial } from '../../barrels/bar-special';

let func = enums.FuncEnum.FetchSql;

export async function fetchSql(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
  udfs: interfaces.Udf[];
  weekStart: api.ProjectWeekStartEnum;
  projectId: string;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  await forEachSeries(item.dashboards, async (x: interfaces.Dashboard) => {
    await forEachSeries(x.reports, async (report: interfaces.Report) => {
      let model = item.models.find(m => m.name === report.model);

      let filters: { [filter: string]: string[] } = {};

      if (helper.isDefined(report.filters)) {
        Object.keys(report.filters).forEach(filter => {
          // remove empty filters
          if (report.filters[filter].length > 0) {
            filters[filter] = report.filters[filter];
          }
        });
      }

      let resItem = await barSpecial.genSql({
        model: model,
        select: report.select,
        sorts: report.sorts,
        timezone: report.timezone,
        limit: report.limit,
        filters: filters,
        weekStart: item.weekStart,
        projectId: item.projectId,
        udfs_user: item.udfs,
        structId: item.structId
      });

      report.filtersFractions = resItem.filtersFractions;
      report.sql = resItem.sql;
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, item.dashboards);

  return item.dashboards;
}
