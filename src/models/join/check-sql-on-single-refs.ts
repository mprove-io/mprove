import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkSqlOnSingleRefs(item: {
  models: interfaces.Model[]
}) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {

        if (nextModel) { return; }

        // collect references
        let reg = ApRegex.CAPTURE_SINGLE_REF_G();
        let r;

        let references: string[] = [];

        while (r = reg.exec(join.sql_on)) {
          references.push(r[1]);
        }

        references.forEach(reference => {

          if (nextModel) { return; }

          let referenceField = x.fields.find(f => f.name === reference);

          if (!referenceField) {
            // error e39
            ErrorsCollector.addError(new AmError({
              title: `sql_on refs model missing field`,
              message: `field "${reference}" is missing or not valid`,
              lines: [{
                line: join.sql_on_line_num,
                name: x.file,
                path: x.path,
              }],
            }));

            nextModel = true;
            return;

          } else if (referenceField.field_class === enums.FieldClassEnum.Filter) {
            // error e242
            ErrorsCollector.addError(new AmError({
              title: `sql_on refs model filter`,
              message: `"sql_on:" can't reference filters. Found referencing "${reference}".`,
              lines: [{
                line: join.sql_on_line_num,
                name: x.file,
                path: x.path,
              }],
            }));

            nextModel = true;
            return;

          } else if (referenceField.field_class === enums.FieldClassEnum.Calculation) {
            // error e20
            ErrorsCollector.addError(new AmError({
              title: `sql_on refs model calculation`,
              message: `"sql_on:" can't reference calculations. Found referencing "${reference}".`,
              lines: [{
                line: join.sql_on_line_num,
                name: x.file,
                path: x.path,
              }],
            }));

            nextModel = true;
            return;

          } else if (referenceField.field_class === enums.FieldClassEnum.Measure) {
            // error e21
            ErrorsCollector.addError(new AmError({
              title: `sql_on refs model measure`,
              message: `"sql_on:" can't reference measures. Found referencing "${reference}".`,
              lines: [{
                line: join.sql_on_line_num,
                name: x.file,
                path: x.path,
              }],
            }));

            nextModel = true;
            return;
          }
        });
      });

    if (nextModel) { return; }

    newModels.push(x);
  });

  return newModels;
}