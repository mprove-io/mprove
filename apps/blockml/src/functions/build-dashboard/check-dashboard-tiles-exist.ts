import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckDashboardTilesExist;

export function checkDashboardTilesExist(
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

  item.dashboards.forEach(x => {
    if (isUndefined(x.tiles)) {
      x.tiles = [];
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Ds, item.dashboards);

  return item.dashboards;
}
