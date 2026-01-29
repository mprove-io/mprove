import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { FileDashboard } from '#common/interfaces/blockml/internal/file-dashboard';
import { FileReport } from '#common/interfaces/blockml/internal/file-report';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { checkTopParameters } from '../extra/check-top-parameters';
import { log } from '../extra/log';

let func = FuncEnum.CheckDashboardTopParameters;

export function checkDashboardTopParameters(
  item: {
    dashboards: FileDashboard[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, stores } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newDashboards: FileReport[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    checkTopParameters(
      {
        fields: x.fields,
        stores: stores,
        parametersLineNum: x.parameters_line_num,
        fileName: x.fileName,
        filePath: x.filePath,
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    );

    if (errorsOnStart === item.errors.length) {
      newDashboards.push(x);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Entities, newDashboards);

  return newDashboards;
}
