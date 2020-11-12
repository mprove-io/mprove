import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';

type t1 = interfaces.View | interfaces.Model | interfaces.Dashboard;

export function checkFieldIsObject<T extends t1>(item: {
  entities: Array<T>;
  errors: BmError[];
}) {
  item.entities.forEach(x => {
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

    x.fields = newFields;
  });

  return item.entities;
}
