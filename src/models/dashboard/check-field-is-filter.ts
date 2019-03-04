import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkFieldIsFilter(item: { dashboards: interfaces.Dashboard[] }) {

  item.dashboards.forEach(x => {

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {

      if (field.field_class !== enums.FieldClassEnum.Filter) {

        // error e263
        ErrorsCollector.addError(new AmError({
          title: `field is not a filter`,
          message: `dashboard fields can only be filters`,
          lines: [{
            line: field.field_class_line_num,
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

  return item.dashboards;
}