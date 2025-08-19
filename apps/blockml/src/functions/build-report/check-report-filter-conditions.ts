import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { checkVmdrFilterConditions } from '../extra/check-vmdr-filter-conditions';
import { log } from '../extra/log';

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
