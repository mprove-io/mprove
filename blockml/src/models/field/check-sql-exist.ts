import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkSqlExist<
  T extends interfaces.View | interfaces.Model | interfaces.Dashboard
>(item: { entities: Array<T> }) {
  item.entities.forEach(x => {
    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {
      if (field.field_class === enums.FieldClassEnum.Filter) {
        if (!(typeof field.sql === 'undefined' || field.sql === null)) {
          // error e222
          ErrorsCollector.addError(
            new AmError({
              title: `unexpected sql in filter`,
              message: `parameter "sql" can not be used with 'filter' field`,
              lines: [
                {
                  line: field.sql_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        } else {
          // just for fields deps logic
          field.sql = '';
          field.sql_line_num = 0;
        }
      } else if (
        (typeof field.sql === 'undefined' || field.sql === null) &&
        ['dimension', 'time', 'measure', 'calculation'].indexOf(
          field.field_class
        ) > -1
      ) {
        // error e25
        ErrorsCollector.addError(
          new AmError({
            title: `missing sql`,
            message: `parameter "sql:" is required for "${field.field_class}"`,
            lines: [
              {
                line: field.field_class_line_num,
                name: x.file,
                path: x.path
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
