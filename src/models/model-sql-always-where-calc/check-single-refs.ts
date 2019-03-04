import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkSingleRefs(item: {
  models: interfaces.Model[]
}) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    if (typeof x.sql_always_where_calc === 'undefined' || x.sql_always_where_calc === null) {
      newModels.push(x);
      return;
    }

    // collect single references
    let reg = ApRegex.CAPTURE_SINGLE_REF_G();
    let r;

    let references: string[] = [];

    while (r = reg.exec(x.sql_always_where_calc)) {
      references.push(r[1]);
    }

    references.forEach(reference => {

      if (nextModel) { return; }

      let referenceField = x.fields.find(f => f.name === reference);

      if (!referenceField) {
        // error e155
        ErrorsCollector.addError(new AmError({
          title: `sql_always_where_calc refs missing field`,
          message: `field "${reference}" is missing or not valid`,
          lines: [{
            line: x.sql_always_where_calc_line_num,
            name: x.file,
            path: x.path,
          }],
        }));

        nextModel = true;
        return;

      } else if (referenceField.field_class === enums.FieldClassEnum.Filter) {
        // error e248
        ErrorsCollector.addError(new AmError({
          title: `sql_always_where_calc refs model filter`,
          message: `sql_always_where_calc can't reference filters. Found referencing "${reference}".`,
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

    if (nextModel) { return; }

    newModels.push(x);
  });

  return newModels;
}
