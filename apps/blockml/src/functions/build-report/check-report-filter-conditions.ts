import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.CheckReportFilterConditions;

export function checkReportFilterConditions(
  item: {
    reports: FileReport[];
    errors: BmError[];
    structId: string;
    caseSensitiveStringFilters: boolean;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, caseSensitiveStringFilters } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newReports = checkVmdrFilterConditions(
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

  return newReports;
}
