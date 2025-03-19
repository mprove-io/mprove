import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckDashboardTopParameters;

export function checkDashboardTopParameters(
  item: {
    dashboards: common.FileDashboard[];
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, stores } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newDashboards: common.FileReport[] = [];

  item.dashboards.forEach(x => {
    let errorsOnStart = item.errors.length;

    barSpecial.checkTopParameters(
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newDashboards
  );

  return newDashboards;
}
