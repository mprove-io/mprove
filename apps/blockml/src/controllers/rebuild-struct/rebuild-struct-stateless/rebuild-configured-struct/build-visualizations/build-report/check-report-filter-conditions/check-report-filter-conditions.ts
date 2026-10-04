import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkFilterConditions } from '#blockml/functions/check-filter-conditions/check-filter-conditions';
import { log } from '#blockml/functions/log/log';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';

import type { FileReport } from '#common/types/blockml/parts/internal/file-report';

let func: Func = 'build-report/check-report-filter-conditions';

export function checkReportFilterConditions(item: {
  reports: FileReport[];
  errors: BmError[];
  structId: string;
  caseSensitiveStringFilters: boolean;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<FileReport[], never> {
  let { cs, ...input } = item;

  let { caller, structId, caseSensitiveStringFilters } = item;

  log(cs, caller, func, structId, 'input.log', input);

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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_dashboards.log', newReports);

  return Result.succeed(newReports);
}
