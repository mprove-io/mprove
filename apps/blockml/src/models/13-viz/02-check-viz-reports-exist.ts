import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckVizReportsExist;

export function checkVizReportsExist(
  item: {
    vizs: interfaces.Viz[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newVizs: interfaces.Viz[] = [];

  item.vizs.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.reports)) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.VIS_MISSING_REPORTS,
          message:
            `${common.FileExtensionEnum.Vis} must have ` +
            `"${enums.ParameterEnum.Reports}" parameter`,
          lines: [
            {
              line: x.vis_line_num,
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
          title: enums.ErTitleEnum.VIS_TOO_MANY_REPORTS,
          message: `${common.FileExtensionEnum.Vis} must have exactly one report`,
          lines: [
            {
              line: x.vis_line_num,
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
