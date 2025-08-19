import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

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
