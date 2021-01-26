import { ConfigService } from '@nestjs/config';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CheckDashboardReportsExist;

export function checkDashboardReportsExist(
  item: {
    dashboards: interfaces.Dashboard[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.dashboards.forEach(x => {
    if (helper.isUndefined(x.reports)) {
      x.reports = [];
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Ds, item.dashboards);

  return item.dashboards;
}
