import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkViewFiltersFromField(item: {
  views: interfaces.View[]
}) {

  item.views.forEach(x => {

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {

      if (field.result === enums.FieldExtResultEnum.FromField) {

        if (typeof field.from_field === 'undefined' || field.from_field === null) {
          // error e223
          ErrorsCollector.addError(new AmError({
            title: `missing from_field in view filter`,
            message: `parameter "from_field: field_name" required for filters with "result: from_field"`,
            lines: [{
              line: field.name_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }

        if (field.from_field.match(ApRegex.WORD_CHARACTERS())) {

          let index = x.fields.findIndex(f => f.name === field.from_field);

          if (index < 0) {
            // error e224
            ErrorsCollector.addError(new AmError({
              title: `missing view field`,
              message: `field "${field.from_field}" is missing or not valid in fields section of "${x.name}" view`,
              lines: [{
                line: field.from_field_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            return;
          }

          // also auto check for self reference
          if (x.fields[index].field_class === enums.FieldClassEnum.Filter) {
            // error e226
            ErrorsCollector.addError(new AmError({
              title: `from_field references filter`,
              message: `view filter's "from_field:" can not reference filter`,
              lines: [{
                line: field.from_field_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            return;
          }

          // ok get result from view field
          field.result = x.fields[index].result;

        } else {
          // error e225
          ErrorsCollector.addError(new AmError({
            title: `wrong from_field in view filter`,
            message: `view filter's "from_field:" value must be specified in a form of "field_name"`,
            lines: [{
              line: field.from_field_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }
      }

      newFields.push(field);
    });

    x.fields = newFields;
  });

  return item.views;
}