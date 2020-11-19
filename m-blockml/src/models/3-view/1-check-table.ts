import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckTable;

export function checkTable(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (
      Object.keys(x).indexOf(enums.ParameterEnum.Table) < 0 &&
      Object.keys(x).indexOf(enums.ParameterEnum.DerivedTable) < 0
    ) {
      // error e136
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.MISSING_TABLE,
          message: `${api.FileExtensionEnum.View} must have "${enums.ParameterEnum.Table}" or "${enums.ParameterEnum.DerivedTable}" parameter`,
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

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newViews.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
