import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CheckVizReportsExist;

export function checkVizReportsExist(
  item: {
    vizs: interfaces.Viz[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newVizs: interfaces.Viz[] = [];

  item.vizs.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isUndefined(x.reports)) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.VIZ_MISSING_REPORTS,
          message:
            `${api.FileExtensionEnum.Viz} must have ` +
            `"${enums.ParameterEnum.Reports}" parameter`,
          lines: [
            {
              line: x.viz_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (x.reports.length > 1) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.VIZ_TOO_MANY_REPORTS,
          message: `${api.FileExtensionEnum.Viz} must have exactly one report`,
          lines: [
            {
              line: x.viz_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (errorsOnStart === item.errors.length) {
      newVizs.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Vizs, newVizs);

  return newVizs;
}
