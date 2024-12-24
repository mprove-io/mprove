import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckDashboardFilterConditions;

export function checkDashboardFilterConditions(
  item: {
    dashboards: common.FileDashboard[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, caseSensitiveStringFilters } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newDashboards = barSpecial.checkVmdrFilterConditions(
    {
      entities: item.dashboards,
      errors: item.errors,
      structId: item.structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      caller: item.caller
    },
    cs
  );

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
