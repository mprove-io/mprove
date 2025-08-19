import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckDashboardFilterConditions;

export function checkDashboardFilterConditions(
  item: {
    dashboards: FileDashboard[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, caseSensitiveStringFilters } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newDashboards = checkVmdrFilterConditions(
    {
      entities: item.dashboards,
      errors: item.errors,
      structId: item.structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      caller: item.caller
    },
    cs
  );

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Ds, newDashboards);

  return newDashboards;
}
