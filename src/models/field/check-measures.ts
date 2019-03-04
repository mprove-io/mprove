import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkMeasures
  <T extends (interfaces.View | interfaces.Model)>(item: {
    entities: Array<T>
  }): Array<T> {

  item.entities.forEach((x: T) => {

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {

      if (field.field_class !== enums.FieldClassEnum.Measure) {
        newFields.push(field);
        return;
      }
      // measures

      if (typeof field.type === 'undefined' || field.type === null) {
        // error e22
        ErrorsCollector.addError(new AmError({
          title: `missing type for measure`,
          message: `parameter "type:" is required for measures`,
          lines: [{
            line: field.name_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;

      } else if ([ // must be explicit
        enums.FieldExtTypeEnum.CountDistinct,
        enums.FieldExtTypeEnum.SumByKey,
        enums.FieldExtTypeEnum.AverageByKey,
        enums.FieldExtTypeEnum.MedianByKey,
        enums.FieldExtTypeEnum.PercentileByKey,
        enums.FieldExtTypeEnum.Min,
        enums.FieldExtTypeEnum.Max,
        enums.FieldExtTypeEnum.List,
        enums.FieldExtTypeEnum.Custom,
      ].indexOf(field.type) < 0) {
        // error e166
        ErrorsCollector.addError(new AmError({
          title: `wrong measure type`,
          message: `measure "type:" parameter's value is not valid`,
          lines: [{
            line: field.type_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;

      } else if (!field.sql_key &&
        [
          enums.FieldExtTypeEnum.SumByKey,
          enums.FieldExtTypeEnum.AverageByKey,
          enums.FieldExtTypeEnum.MedianByKey,
          enums.FieldExtTypeEnum.PercentileByKey,
        ].indexOf(field.type) > -1) {
        // error e165
        ErrorsCollector.addError(new AmError({
          title: `missing sql_key`,
          message: `parameter "sql_key:" is required for measure of ${field.type} type`,
          lines: [{
            line: field.name_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      if (field.type === enums.FieldExtTypeEnum.PercentileByKey) {
        if (typeof field.percentile === 'undefined' || field.percentile === null) {
          // error e216
          ErrorsCollector.addError(new AmError({
            title: `missing percentile`,
            message: `parameter "percentile" is required for measure of type ${field.type}`,
            lines: [{
              line: field.name_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;

        } else {

          let reg = ApRegex.DIGITS_1_TO_99_G();

          let r = reg.exec(field.percentile);

          if (!r) {
            // error e217
            ErrorsCollector.addError(new AmError({
              title: `wrong percentile`,
              message: `percentile's value must be integer strictly between 0 and 100`,
              lines: [{
                line: field.percentile_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            return;
          }
        }
      }

      if (field.sql && !field.sql.match(ApRegex.CONTAINS_BLOCKML_REF())) {
        // error e277
        ErrorsCollector.addError(new AmError({
          title: `missing blockml reference`,
          message: `measure sql must be a BlockML reference to dimension`,
          lines: [{
            line: field.sql_line_num,
            name: x.file,
            path: x.path,
          }],
        }));
        return;
      }

      if (field.sql_key && !field.sql_key.match(ApRegex.CONTAINS_BLOCKML_REF())) {
        // error e278
        ErrorsCollector.addError(new AmError({
          title: `missing blockml reference`,
          message: `measure sql_key must be a BlockML reference to dimension`,
          lines: [{
            line: field.sql_key_line_num,
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
