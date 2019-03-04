import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkDimensions<
  T extends interfaces.View | interfaces.Model
>(item: { entities: Array<T> }): Array<T> {
  item.entities.forEach((x: T) => {
    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {
      if (field.field_class !== enums.FieldClassEnum.Dimension) {
        newFields.push(field);
        return;
      }

      // dimensions
      if (typeof field.type === 'undefined' || field.type === null) {
        field.type = enums.FieldExtTypeEnum.Custom;
        field.type_line_num = 0;
        newFields.push(field);
        return;
      } else if (
        [
          enums.FieldExtTypeEnum.Custom,
          enums.FieldExtTypeEnum.YesnoIsTrue
        ].indexOf(field.type) < 0
      ) {
        // error e66
        ErrorsCollector.addError(
          new AmError({
            title: `wrong dimension type`,
            message: `"${field.type}" is not valid type for dimension`,
            lines: [
              {
                line: field.type_line_num,
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
