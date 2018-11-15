import { formatSpecifier } from 'd3-format';
import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

let Graph = require('graph.js/dist/graph.full.js'); // tslint:disable-line

export function checkAndSetImplicitFormatNumber<
  T extends interfaces.View | interfaces.Model | interfaces.Dashboard
>(item: { entities: Array<T> }): Array<T> {
  item.entities.forEach((x: T) => {
    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {
      if (field.result === enums.FieldExtResultEnum.Number) {
        if (
          typeof field.format_number === 'undefined' ||
          field.format_number === null
        ) {
          // set default
          field.format_number = '';
          field.format_number_line_num = 0;
        } else {
          try {
            let fs = formatSpecifier(field.format_number);
          } catch (e) {
            ErrorsCollector.addError(
              new AmError({
                title: `wrong format_number`,
                message: `format_number value "${
                  field.format_number
                }" is not valid`,
                lines: [
                  {
                    line: field.format_number_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            return;
          }
        }

        if (
          typeof field.currency_prefix === 'undefined' ||
          field.currency_prefix === null
        ) {
          // set default
          field.currency_prefix = '$';
          field.currency_prefix_line_num = 0;
        }

        if (
          typeof field.currency_suffix === 'undefined' ||
          field.currency_suffix === null
        ) {
          // set default
          field.currency_suffix = '';
          field.currency_suffix_line_num = 0;
        }
      } else {
        if (
          typeof field.format_number !== 'undefined' &&
          field.format_number !== null
        ) {
          // error e268
          ErrorsCollector.addError(
            new AmError({
              title: `misuse of format_number by field's result`,
              message:
                `format_number can only be used with fields where result is "number". ` +
                `Found field result "${field.result}".`,
              lines: [
                {
                  line: field.format_number_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        }

        if (
          typeof field.currency_prefix !== 'undefined' &&
          field.currency_prefix !== null
        ) {
          // error e269
          ErrorsCollector.addError(
            new AmError({
              title: `misuse of currency_prefix by field's result`,
              message:
                `currency_prefix can only be used with fields where result is "number". ` +
                `Found field result "${field.result}".`,
              lines: [
                {
                  line: field.currency_prefix_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        }

        if (
          typeof field.currency_suffix !== 'undefined' &&
          field.currency_suffix !== null
        ) {
          // error e270
          ErrorsCollector.addError(
            new AmError({
              title: `misuse of currency_suffix by field's result`,
              message:
                `currency_suffix can only be used with fields where result is "number". ` +
                `Found field result "${field.result}".`,
              lines: [
                {
                  line: field.currency_suffix_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        }
      }

      newFields.push(field);
    });

    x.fields = newFields;
  });

  return item.entities;
}
