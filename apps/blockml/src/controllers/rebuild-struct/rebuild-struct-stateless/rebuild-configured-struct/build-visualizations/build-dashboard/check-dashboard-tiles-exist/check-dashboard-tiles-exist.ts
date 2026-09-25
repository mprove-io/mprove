import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';

let func = FuncEnum.CheckDashboardTilesExist;

export function checkDashboardTilesExist(item: {
  dashboards: FileDashboard[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

  item.dashboards.forEach(x => {
    if (isUndefined(x.tiles)) {
      x.tiles = [];
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Ds, item.dashboards);

  return Result.succeed(item.dashboards);
}
