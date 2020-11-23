import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { types } from '../../barrels/types';
import { api } from '../../barrels/api';

let func = enums.FuncEnum.CheckFieldsExist;

export function checkFieldsExist<T extends types.vmdType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (
      helper.isUndefined(x.fields) &&
      x.fileExt === api.FileExtensionEnum.View
    ) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.MISSING_FIELDS,
          message: `parameter "${enums.ParameterEnum.Fields}" is required for ${x.fileExt} file`,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (helper.isUndefined(x.fields)) {
      x.fields = [];
    }

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
