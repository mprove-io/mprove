import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckJoinHideShowFields;

export function checkJoinHideShowFields(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins.forEach(join => {
      if (
        helper.isDefined(join[enums.ParameterEnum.HideFields]) &&
        helper.isDefined(join[enums.ParameterEnum.ShowFields])
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.JOIN_HIDE_AND_SHOW_FIELDS,
            message:
              `parameters "${enums.ParameterEnum.ShowFields}" ` +
              `and "${enums.ParameterEnum.HideFields}" can not be specified at the same time`,
            lines: [
              {
                line: join[enums.ParameterEnum.HideFields + constants.LINE_NUM],
                name: x.fileName,
                path: x.filePath
              },
              {
                line: join[enums.ParameterEnum.ShowFields + constants.LINE_NUM],
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (helper.isDefined(join[enums.ParameterEnum.HideFields])) {
      }

      if (helper.isDefined(join[enums.ParameterEnum.ShowFields])) {
      }
    });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
