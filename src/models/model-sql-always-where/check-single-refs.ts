import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkSingleRefs(item: { models: interfaces.Model[] }) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let nextModel: boolean = false;

    if (
      typeof x.sql_always_where === 'undefined' ||
      x.sql_always_where === null
    ) {
      newModels.push(x);
      return;
    }

    // collect single references
    let reg = ApRegex.CAPTURE_SINGLE_REF_G();
    let r;

    let references: string[] = [];

    while ((r = reg.exec(x.sql_always_where))) {
      references.push(r[1]);
    }

    references.forEach(reference => {
      if (nextModel) {
        return;
      }

      let referenceField = x.fields.find(f => f.name === reference);

      if (!referenceField) {
        // error e149
        ErrorsCollector.addError(
          new AmError({
            title: `sql_always_where refs missing field`,
            message: `field "${reference}" is missing or not valid`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );

        nextModel = true;
        return;
      } else if (referenceField.field_class === enums.FieldClassEnum.Filter) {
        // error e246
        ErrorsCollector.addError(
          new AmError({
            title: `sql_always_where refs model filter`,
            message: `sql_always_where can't reference filters. Found referencing "${reference}".`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );

        nextModel = true;
        return;
      } else if (referenceField.field_class === enums.FieldClassEnum.Measure) {
        // error e151
        ErrorsCollector.addError(
          new AmError({
            title: `sql_always_where refs measure`,
            message: `sql_always_where can't reference measures. Found referencing "${reference}".`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );

        nextModel = true;
        return;
      } else if (
        referenceField.field_class === enums.FieldClassEnum.Calculation
      ) {
        // error e150
        ErrorsCollector.addError(
          new AmError({
            title: `sql_always_where refs calculation`,
            message: `sql_always_where can't reference calculations. Found referencing "${reference}".`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );

        nextModel = true;
        return;
      }
    });

    if (nextModel) {
      return;
    }

    newModels.push(x);
  });

  return newModels;
}
