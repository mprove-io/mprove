import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkAccess } from '#blockml/functions/check-access/check-access';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FileChart } from '#common/zod/blockml/internal/file-chart';

let func = FuncEnum.CheckChartAccess;

export function checkChartAccess(item: {
  charts: FileChart[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileChart[], never> {
  let { cs, ...input } = item;

  let { caller, structId } = input;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

  let newCharts: FileChart[] = checkAccess(
    {
      entities: item.charts,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Charts, newCharts);

  return Result.succeed(newCharts);
}
