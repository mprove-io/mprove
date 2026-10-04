import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkFilterConditions } from '#blockml/functions/check-filter-conditions/check-filter-conditions';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';

let func: Func = 'build-dashboard/check-dashboard-filter-conditions';

export function checkDashboardFilterConditions(item: {
  dashboards: FileDashboard[];
  errors: BmError[];
  structId: string;
  caseSensitiveStringFilters: boolean;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileDashboard[], never> {
  let { cs, ...input } = item;

  let { caller, structId, caseSensitiveStringFilters } = input;

  log(cs, caller, func, structId, 'input.log', input);

  let newDashboards: FileDashboard[] = checkFilterConditions(
    {
      entities: item.dashboards,
      errors: item.errors,
      structId: item.structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      caller: item.caller
    },
    cs
  );

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_dashboards.log', newDashboards);

  return Result.succeed(newDashboards);
}
