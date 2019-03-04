import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkFieldIsObject
  <T extends (interfaces.View | interfaces.Model | interfaces.Dashboard)>(item: {
    entities: Array<T>
  }) {
  item.entities.forEach(x => {

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {

      if (!(!!field && field.constructor === Object)) {
        // error e262
        ErrorsCollector.addError(new AmError({
          title: `field is not an Object`,
          message: `found field that is not a Hash`,
          lines: [{
            line: x.fields_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }
      newFields.push(field);
    });

    x.fields = newFields;
  });

  return item.entities;
}
