import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkFieldDeclaration
  <T extends (interfaces.View | interfaces.Model | interfaces.Dashboard)>(item: {
    entities: Array<T>
  }) {

  item.entities.forEach(x => {

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {

      let declarations: string[] = Object.keys(field)
        .filter(k => k.match(ApRegex.FIELD_DECLARATION_G()));

      let fieldKeysLineNums: number[] = Object.keys(field)
        .filter(y => y.match(ApRegex.ENDS_WITH_LINE_NUM()))
        .map(y => (<any>field)[y]);

      if (declarations.length === 0) {
        // error e24
        ErrorsCollector.addError(new AmError({
          title: `missing field declaration`,
          message: `field must contain one of parameters: dimension, time, measure, calculation, filter`,
          lines: [{
            line: Math.min(...fieldKeysLineNums),
            name: x.file,
            path: x.path,
          }],
        }));
        return;

      } else if (declarations.length > 1) {
        // error e23
        ErrorsCollector.addError(new AmError({
          title: `too many declarations for one field`,
          message: `field must contain only one of parameters: dimension, measure, time, calculation, filter`,
          lines: [{
            line: Math.min(...fieldKeysLineNums),
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      let declaration = declarations[0];

      if ((<any>field)[declaration].match(ApRegex.CAPTURE_SPECIAL_CHARS_G())) {
        // error e276
        ErrorsCollector.addError(new AmError({
          title: `field declaration wrong value`,
          message: `parameter "${declaration}" contains wrong characters or whitespace`,
          lines: [{
            line: (<any>field)[declaration + '_line_num'],
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      let fieldClass = declarations[0];
      let fieldClassLineNum = (<any>field)[fieldClass + '_line_num'];
      let fieldName = (<any>field)[fieldClass];

      delete (<any>field)[fieldClass];
      delete (<any>field)[fieldClass + '_line_num'];

      let nField = Object.assign({}, field, {
        field_class: fieldClass,
        name: fieldName,
        field_class_line_num: fieldClassLineNum,
        name_line_num: fieldClassLineNum
      });

      newFields.push(nField);
    });

    x.fields = newFields;
  });

  return item.entities;
}