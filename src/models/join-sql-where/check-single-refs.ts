import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkSingleRefs(item: { models: interfaces.Model[] }) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let nextModel: boolean = false;

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {
        if (nextModel) {
          return;
        }

        if (typeof join.sql_where === 'undefined' && join.sql_where === null) {
          return;
        }

        // collect references
        let reg = ApRegex.CAPTURE_SINGLE_REF_G();
        let r;

        let references: string[] = [];

        while ((r = reg.exec(join.sql_where))) {
          references.push(r[1]);
        }

        references.forEach(reference => {
          if (nextModel) {
            return;
          }

          let referenceField = x.fields.find(f => f.name === reference);

          if (!referenceField) {
            // error e162
            ErrorsCollector.addError(
              new AmError({
                title: `Join sql_where refs missing field`,
                message: `field "${reference}" is missing or not valid`,
                lines: [
                  {
                    line: join.sql_where_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );

            nextModel = true;
            return;
          } else if (
            referenceField.field_class === enums.FieldClassEnum.Filter
          ) {
            // error e244
            ErrorsCollector.addError(
              new AmError({
                title: `Join sql_where refs model filter`,
                message: `Join sql_where can't reference filters. Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_where_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );

            nextModel = true;
            return;
          } else if (
            referenceField.field_class === enums.FieldClassEnum.Measure
          ) {
            // error e163
            ErrorsCollector.addError(
              new AmError({
                title: `Join sql_where refs measure`,
                message: `Join sql_where can't reference measures. Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_where_line_num,
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
            // error e164
            ErrorsCollector.addError(
              new AmError({
                title: `Join sql_where refs calculation`,
                message: `Join sql_where can't reference calculations. Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_where_line_num,
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
      });

    if (nextModel) {
      return;
    }

    newModels.push(x);
  });

  return newModels;
}
