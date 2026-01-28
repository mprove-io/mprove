import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { FileDashboard } from '#common/interfaces/blockml/internal/file-dashboard';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from '../extra/log';

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
