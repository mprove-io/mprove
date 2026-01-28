import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { FileDashboard } from '#common/interfaces/blockml/internal/file-dashboard';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { checkAccess } from '../extra/check-access';
import { log } from '../extra/log';

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
