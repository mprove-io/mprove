import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { barSpecial } from '../../barrels/bar-special';
import { types } from '../../barrels/types';
import { RabbitService } from '../../services/rabbit.service';
import asyncPool from 'tiny-async-pool';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.FetchSql;

export async function fetchSql<T extends types.dzType>(
  item: {
    traceId: string;
    entities: Array<T>;
    models: interfaces.Model[];
    udfsDict: api.UdfsDict;
    weekStart: api.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  rabbitService: RabbitService,
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let reports: interfaces.Report[] = [];

  item.entities.forEach(z => {
    reports = [...reports, ...z.reports];
  });

  let concurrencyLimit = cs.get<interfaces.Config['blockmlConcurrencyLimit']>(
    'blockmlConcurrencyLimit'
  );

  await asyncPool(
    concurrencyLimit,
    reports,
    async (report: interfaces.Report) => {
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

      report.combinedFilters = filters;

      let { sql, filtersFractions, varsSqlSteps } = await barSpecial.genSql(
        rabbitService,
        cs,
        item.traceId,
        {
          weekStart: item.weekStart,
          timezone: report.timezone,
          select: report.select,
          sorts: report.sorts,
          limit: report.limit,
          filters: report.combinedFilters,
          model: model,
          udfsDict: item.udfsDict
        }
      );

      report.sql = sql;
      report.filtersFractions = filtersFractions;
      report.varsSqlSteps = varsSqlSteps;
    }
  );

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    item.entities
  );
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.entities;
}
