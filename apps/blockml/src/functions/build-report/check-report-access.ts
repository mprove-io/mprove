import { ConfigService } from '@nestjs/config';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { FileReport } from '#common/interfaces/blockml/internal/file-report';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { checkAccess } from '../extra/check-access';
import { log } from '../extra/log';

let func = FuncEnum.CheckReportAccess;

export function checkReportAccess(
  item: {
    reports: FileReport[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newReports = checkAccess(
    {
      entities: item.reports,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Reports, newReports);

  return newReports;
}
