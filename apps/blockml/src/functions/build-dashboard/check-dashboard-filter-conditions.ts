import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { FileDashboard } from '#common/interfaces/blockml/internal/file-dashboard';
import { checkFilterConditions } from '../extra/check-filter-conditions';
import { log } from '../extra/log';

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

  let newDashboards = checkFilterConditions(
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
