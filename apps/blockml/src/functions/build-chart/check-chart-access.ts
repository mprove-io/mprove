import { log } from 'console';
import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { FileChart } from '~common/interfaces/blockml/internal/file-chart';
import { checkAccess } from '../extra/check-access';

let func = FuncEnum.CheckChartAccess;

export function checkChartAccess(
  item: {
    charts: FileChart[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newCharts = checkAccess(
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

  return newCharts;
}
