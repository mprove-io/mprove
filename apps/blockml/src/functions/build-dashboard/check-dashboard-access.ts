import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckDashboardAccess;

export function checkDashboardAccess(
  item: {
    dashboards: FileDashboard[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newDashboards = checkAccess(
    {
      entities: item.dashboards,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
