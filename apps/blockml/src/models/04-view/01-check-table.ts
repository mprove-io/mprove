import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckTable;

export function checkTable(
  item: {
    views: interfaces.View[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (
      Object.keys(x).indexOf(enums.ParameterEnum.Table) < 0 &&
      Object.keys(x).indexOf(enums.ParameterEnum.DerivedTable) < 0
    ) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.MISSING_TABLE,
          message: `${common.FileExtensionEnum.View} must have "${enums.ParameterEnum.Table}" or "${enums.ParameterEnum.DerivedTable}" parameter`,
          lines: [
            {
              line: x.view_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (errorsOnStart === item.errors.length) {
      newViews.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
