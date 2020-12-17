import { forEachSeries } from 'p-iteration';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSpecial } from '../../barrels/bar-special';
import { types } from '../../barrels/types';
import { RabbitService } from '../../services/rabbit.service';

let func = enums.FuncEnum.FetchSql;

export async function fetchSql<T extends types.vdType>(item: {
  rabbitService: RabbitService;
  entities: Array<T>;
  models: interfaces.Model[];
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  // TODO: parallel reports

  await forEachSeries(item.entities, async x => {
    await forEachSeries(x.reports, async (report: interfaces.Report) => {
      let model = item.models.find(m => m.name === report.model);

      let filters: interfaces.FilterBricksDictionary = {};

      if (helper.isDefined(report.combinedFilters)) {
        Object.keys(report.combinedFilters).forEach(filter => {
          // remove empty filters
          if (report.combinedFilters[filter].length > 0) {
            filters[filter] = report.combinedFilters[filter];
          }
        });
      }

      let { sql, filtersFractions } = await barSpecial.genSql(
        item.rabbitService,
        {
          model: model,
          select: report.select,
          sorts: report.sorts,
          timezone: report.timezone,
          limit: report.limit,
          filters: filters,
          weekStart: item.weekStart,
          udfsDict: item.udfsDict,
          structId: item.structId,
          errors: item.errors,
          caller: item.caller
        }
      );

      report.sql = sql;
      report.filtersFractions = filtersFractions;
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, item.entities);

  return item.entities;
}
