import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
import { RabbitService } from '~blockml/services/rabbit.service';

let func = common.FuncEnum.FetchSql;

export async function fetchSql<T extends types.dzType>(
  item: {
    traceId: string;
    entities: T[];
    models: common.FileModel[];
    udfsDict: common.FileUdfsDict;
    weekStart: common.ProjectWeekStartEnum;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  rabbitService: RabbitService,
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let reports: common.FileReport[] = [];

  item.entities.forEach(x => {
    reports = [...reports, ...x.reports];
  });

  let concurrencyLimit =
    cs.get<interfaces.Config['concurrencyLimit']>('concurrencyLimit');

  await asyncPool(
    concurrencyLimit,
    reports,
    async (report: common.FileReport) => {
      let model = item.models.find(m => m.name === report.model);

      let filters: common.FilterBricksDictionary = {};

      if (common.isDefined(report.combinedFilters)) {
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    item.entities
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Models,
    item.models
  );

  return item.entities;
}
