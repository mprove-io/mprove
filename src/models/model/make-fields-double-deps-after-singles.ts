import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function makeFieldsDoubleDepsAfterSingles(item: {
  models: interfaces.Model[]
}) {

  item.models.forEach(x => {

    x.fields_double_deps_after_singles = {};

    x.fields.forEach(f => {

      x.fields_double_deps_after_singles[f.name] = {};

      // work with sql_real
      let restart: boolean = true;

      while (restart) {
        restart = false;

        let r;
        let reg = ApRegex.CAPTURE_DOUBLE_REF_G(); // g works because of restart

        while (r = reg.exec(f.sql_real)) {
          let asName: string = r[1];
          let depName: string = r[2];

          let depJoin = x.joins.find(j => j.as === asName);
          let depField = depJoin.view.fields.find(field => field.name === depName);

          if (depField.field_class === enums.FieldClassEnum.Calculation) {

            f.sql_real = ApRegex.replaceAndConvert(f.sql_real, depField.sql_real, asName, depName);

            restart = true;
            break;

          } else {
            // ok
            if (!x.fields_double_deps_after_singles[f.name][asName]) {
              x.fields_double_deps_after_singles[f.name][asName] = {};
            }

            x.fields_double_deps_after_singles[f.name][asName][depName] = f.sql_line_num;

            if (f.field_class === enums.FieldClassEnum.Calculation
              && depField.field_class === enums.FieldClassEnum.Dimension) {

              if (!f.force_dims[asName]) {
                f.force_dims[asName] = {};
              }

              f.force_dims[asName][depName] = f.sql_line_num;
            }
          }
        }
      }

      // work with sql_key_real
      if (f.field_class === enums.FieldClassEnum.Measure
        && [
          enums.FieldExtTypeEnum.SumByKey,
          enums.FieldExtTypeEnum.AverageByKey,
          enums.FieldExtTypeEnum.MedianByKey,
          enums.FieldExtTypeEnum.PercentileByKey,
        ].indexOf(f.type) > -1) {

        let r2;
        let reg2 = ApRegex.CAPTURE_DOUBLE_REF_G();

        while (r2 = reg2.exec(f.sql_key_real)) {
          let asName2: string = r2[1];
          let depName2: string = r2[2];

          if (!x.fields_double_deps_after_singles[f.name][asName2]) {
            x.fields_double_deps_after_singles[f.name][asName2] = {};
          }

          x.fields_double_deps_after_singles[f.name][asName2][depName2] = f.sql_key_line_num;
        }
      }

    });

  });

  return item.models;
}
