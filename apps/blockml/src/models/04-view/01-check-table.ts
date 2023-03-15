import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckTable;

export function checkTable(
  item: {
    views: common.FileView[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newViews: common.FileView[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (
      Object.keys(x).indexOf(common.ParameterEnum.Table) < 0 &&
      Object.keys(x).indexOf(common.ParameterEnum.DerivedTable) < 0
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.MISSING_TABLE,
          message: `${common.FileExtensionEnum.View} must have "${common.ParameterEnum.Table}" or "${common.ParameterEnum.DerivedTable}" parameter`,
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, newViews);

  return newViews;
}
