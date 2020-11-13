import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { vmdType } from './_vmd-type';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.CheckFieldNameDuplicates;

export function checkFieldNameDuplicates<T extends vmdType>(item: {
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

    // prepare field names

    let fieldNames: Array<{ name: string; lineNumbers: number[] }> = [];

    x.fields.forEach(field => {
      let fName = fieldNames.find(element => element.name === field.name);

      if (fName) {
        fName.lineNumbers.push(field.name_line_num);
      } else {
        fieldNames.push({
          name: field.name,
          lineNumbers: [field.name_line_num]
        });
      }
    });

    // process field names

    fieldNames.forEach(z => {
      if (z.lineNumbers.length > 1) {
        // error e26
        let lines: interfaces.BmErrorCLine[] = z.lineNumbers.map(y => ({
          line: y,
          name: x.fileName,
          path: x.filePath
        }));

        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.DUPLICATE_FIELD_NAMES,
            message: 'Fields must have unique names',
            lines: lines
          })
        );
        return;
      }

      newFields.push(x.fields.find(element => element.name === z.name));
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
