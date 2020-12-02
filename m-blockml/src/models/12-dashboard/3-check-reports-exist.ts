import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckReportsExist;

export function checkReportsExist(item: {
  dashboards: interfaces.Dashboard[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.dashboards.forEach(x => {
    if (helper.isUndefined(x.reports)) {
      x.reports = [];
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Ds, item.dashboards);

  return item.dashboards;
}
