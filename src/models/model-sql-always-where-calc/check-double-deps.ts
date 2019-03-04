import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkDoubleDeps(item: {
  models: interfaces.Model[]
}) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    if (typeof x.sql_always_where_calc === 'undefined' || x.sql_always_where_calc === null) {
      newModels.push(x);
      return;
    }

    Object.keys(x.sql_always_where_calc_double_deps).forEach(depAs => {

      if (nextModel) { return; }

      let depJoin = x.joins.find(j => j.as === depAs);

      if (!depJoin) {
        // error e153
        ErrorsCollector.addError(new AmError({
          title: `wrong alias in sql_always_where_calc reference`,
          message: `found referencing on alias "${depAs}" that is missing in joins elements. ` +
            `Check "as:" values.`,
          lines: [{
            line: x.sql_always_where_calc_line_num,
            name: x.file,
            path: x.path,
          }],
        }));

        nextModel = true;
        return;
      }

      Object.keys(x.sql_always_where_calc_double_deps[depAs]).forEach(depFieldName => {

        if (nextModel) { return; }

        let depField = depJoin.view.fields.find(f => f.name === depFieldName);

        if (!depField) {
          // error e154
          ErrorsCollector.addError(new AmError({
            title: `sql_always_where_calc refs missing field`,
            message: `found referencing to field "${depFieldName}" of view "${depJoin.view.name}" as "${depAs}"`,
            lines: [{
              line: x.sql_always_where_calc_line_num,
              name: x.file,
              path: x.path,
            }],
          }));

          nextModel = true;
          return;

        } else if (depField.field_class === enums.FieldClassEnum.Filter) {
          // error e247
          ErrorsCollector.addError(new AmError({
            title: `sql_always_where_calc refs filter`,
            message: `sql_always_where_calc can not reference filters. ` +
              `Found referencing filter "${depFieldName}" of view "${depJoin.view.name}" as "${depAs}"`,
            lines: [{
              line: x.sql_always_where_calc_line_num,
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
