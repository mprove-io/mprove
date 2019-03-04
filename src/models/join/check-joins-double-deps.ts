import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkJoinsDoubleDeps(item: {
  models: interfaces.Model[]
}) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    Object.keys(x.joins_double_deps)
      .filter(aliasName => aliasName !== x.from_as)
      .forEach(alias => {

        if (nextModel) { return; }


        let join = x.joins.find(j => j.as === alias);

        Object.keys(x.joins_double_deps[alias]).forEach(depAs => {

          if (nextModel) { return; }

          let depJoin = x.joins.find(j => j.as === depAs);

          if (!depJoin) {
            // error e52
            ErrorsCollector.addError(new AmError({
              title: `wrong alias in sql_on reference`,
              message: `found referencing on alias "${depAs}" that is missing in joins elements. Check "as:" values.`,
              lines: [{
                line: join.sql_on_line_num,
                name: x.file,
                path: x.path,
              }],
            }));

            nextModel = true;
            return;
          }

          Object.keys(x.joins_double_deps[alias][depAs]).forEach(depFieldName => {

            if (nextModel) { return; }

            let depField = depJoin.view.fields.find(f => f.name === depFieldName);

            if (!depField) {
              // error e53
              ErrorsCollector.addError(new AmError({
                title: `sql_on refs missing field`,
                message: `found referencing to field "${depFieldName}" of view "${depJoin.view.name}" as "${depAs}"`,
                lines: [{
                  line: join.sql_on_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));

              nextModel = true;
              return;

            } else if (depField.field_class === enums.FieldClassEnum.Filter) {
              // error e241
              ErrorsCollector.addError(new AmError({
                title: `sql_on refs filter`,
                message: `"sql_on:" can't reference filters. ` +
                  `found referencing filter "${depFieldName}" of view "${depJoin.view.name}" as "${depAs}"`,
                lines: [{
                  line: join.sql_on_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));

              nextModel = true;
              return;

            } else if (depField.field_class === enums.FieldClassEnum.Measure) {
              // error e54
              ErrorsCollector.addError(new AmError({
                title: `sql_on refs measure`,
                message: `"sql_on:" can't reference measures. ` +
                  `found referencing measure "${depFieldName}" of view "${depJoin.view.name}" as "${depAs}"`,
                lines: [{
                  line: join.sql_on_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));

              nextModel = true;
              return;

            } else if (depField.field_class === enums.FieldClassEnum.Calculation) {
              // error e55
              ErrorsCollector.addError(new AmError({
                title: `sql_on refs calculation`,
                message: `"sql_on:" can't reference calculations. ` +
                  `found referencing calculation "${depFieldName}" of view "${depJoin.view.name}" as "${depAs}"`,
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
      });

    if (nextModel) { return; }

    newModels.push(x);
  });

  return newModels;
}