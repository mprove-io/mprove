import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkFilterConditions } from '#blockml/functions/check-filter-conditions/check-filter-conditions';
import { log } from '#blockml/functions/log/log';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import type { FileReport } from '#common/zod/blockml/internal/file-report';

let func = FuncEnum.CheckReportFilterConditions;

export function checkReportFilterConditions(item: {
  reports: FileReport[];
  errors: BmError[];
  structId: string;
  caseSensitiveStringFilters: boolean;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let { cs, ...input } = item;

  let { caller, structId, caseSensitiveStringFilters } = item;

  log(cs, caller, func, structId, LogTypeEnum.Input, input);

  let newReports: FileReport[] = checkFilterConditions(
    {
      entities: item.reports,
      errors: item.errors,
      structId: item.structId,
      caseSensitiveStringFilters: caseSensitiveStringFilters,
      caller: item.caller
    },
    cs
  );

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Ds, newReports);

  return Result.succeed(newReports);
}
