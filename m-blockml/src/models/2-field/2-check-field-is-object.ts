import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.CheckFieldIsObject;

type t1 = interfaces.View | interfaces.Model | interfaces.Dashboard;

export function checkFieldIsObject<T extends t1>(item: {
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
    let newFields: interfaces.FieldAny[] = [];

    x.fields.forEach(field => {
      if (field.constructor !== Object) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.FIELD_IS_NOT_A_DICTIONARY,
            message: 'found field that is not a dictionary',
            lines: [
              {
                line: x.fields_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
      newFields.push(field);
    });

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      x.fields = newFields;
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return item.entities;
}
