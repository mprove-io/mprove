import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckModelAccessUsers;

export function checkModelAccessUsers(item: {
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

    if (helper.isDefined(x.access_users)) {
      x.access_users.forEach(u => {
        if (typeof u !== 'string' && !(<any>u instanceof String)) {
          // error e259

          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_MODEL_ACCESS_USERS_ELEMENT,
              message: `found array element ${u} that is not a single value`,
              lines: [
                {
                  line: x.access_users_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
