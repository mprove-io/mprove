import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';

let func: Func = 'build-dashboard/check-dashboard-tiles-exist';

export function checkDashboardTilesExist(item: {
  dashboards: FileDashboard[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

  item.dashboards.forEach(x => {
    if (isUndefined(x.tiles)) {
      x.tiles = [];
    }
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_dashboards.log', item.dashboards);

  return Result.succeed(item.dashboards);
}
