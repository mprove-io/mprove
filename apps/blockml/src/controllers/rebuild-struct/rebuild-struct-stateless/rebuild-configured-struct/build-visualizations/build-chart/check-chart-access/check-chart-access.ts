import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkAccess } from '#blockml/functions/check-access/check-access';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FileChart } from '#common/types/blockml/parts/internal/file-chart';

let func: Func = 'build-chart/check-chart-access';

export function checkChartAccess(item: {
  charts: FileChart[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileChart[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, 'input.log', input);

  let newCharts: FileChart[] = checkAccess(
    {
      entities: item.charts,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_charts.log', newCharts);

  return Result.succeed(newCharts);
}
