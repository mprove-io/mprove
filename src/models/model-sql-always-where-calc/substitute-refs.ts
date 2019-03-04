import { ApRegex } from '../../barrels/am-regex';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function substituteRefs(item: {
  models: interfaces.Model[]
}) {

  item.models.forEach(x => {

    x.sql_always_where_calc_force_dims = {};
    x.sql_always_where_calc_deps_after_singles = {};
    x.sql_always_where_calc_double_deps_after_substitutions = {};

    if (typeof x.sql_always_where_calc === 'undefined' || x.sql_always_where_calc === null) {
      return;
    }

    let sqlAlwaysWhereCalcReal = x.sql_always_where_calc;

    // substitute SINGLE calculations
    let restartSingles: boolean = true;

    while (restartSingles) {

      restartSingles = false;

      let reg = ApRegex.CAPTURE_SINGLE_REF_G(); // g works because of restart
      let r;

      while (r = reg.exec(sqlAlwaysWhereCalcReal)) {
        let fieldName = r[1];
        let referenceField = x.fields.find(f => f.name === fieldName);

        switch (true) {

          case referenceField.field_class === enums.FieldClassEnum.Calculation: {

            // referenceField.sql_real
            // ${calc1}   >>>   (${dim2} + ${b.order_items_total} + ${mea1})
            sqlAlwaysWhereCalcReal =
              ApRegex.replaceSingleRefs(sqlAlwaysWhereCalcReal, fieldName, referenceField.sql_real);

            restartSingles = true;
            break;
          }

          case referenceField.field_class === enums.FieldClassEnum.Dimension: {
            x.sql_always_where_calc_deps_after_singles[fieldName] = x.sql_always_where_calc_line_num;

            if (!x.sql_always_where_calc_force_dims['mf']) {
              x.sql_always_where_calc_force_dims['mf'] = {};
            }

            x.sql_always_where_calc_force_dims['mf'][fieldName] = x.sql_always_where_calc_line_num;

            break;
          }

          case referenceField.field_class === enums.FieldClassEnum.Measure: {
            x.sql_always_where_calc_deps_after_singles[fieldName] = x.sql_always_where_calc_line_num;
            break;
          }
        }

      }
    }


    // substitute DOUBLE calculations
    let restart2: boolean = true;

    while (restart2) {

      restart2 = false;

      let reg2 = ApRegex.CAPTURE_DOUBLE_REF_G(); // g works because of restart
      let r2;

      while (r2 = reg2.exec(sqlAlwaysWhereCalcReal)) {

        let asName = r2[1];
        let depName = r2[2];

        let join = x.joins.find(j => j.as === asName);

        let depField = join.view.fields.find(f => f.name === depName);

        switch (true) {

          case depField.field_class === enums.FieldClassEnum.Calculation: {

            sqlAlwaysWhereCalcReal =
              ApRegex.replaceAndConvert(sqlAlwaysWhereCalcReal, depField.sql_real, asName, depName);

            restart2 = true;
            break;
          }

          case depField.field_class === enums.FieldClassEnum.Dimension: {
            if (!x.sql_always_where_calc_double_deps_after_substitutions[asName]) {
              x.sql_always_where_calc_double_deps_after_substitutions[asName] = {};
            }
            x.sql_always_where_calc_double_deps_after_substitutions[asName][depName] =
              x.sql_always_where_calc_line_num;


            if (!x.sql_always_where_calc_force_dims[asName]) {
              x.sql_always_where_calc_force_dims[asName] = {};
            }
            x.sql_always_where_calc_force_dims[asName][depName] = x.sql_always_where_calc_line_num;

            break;
          }

          case depField.field_class === enums.FieldClassEnum.Measure: {
            if (!x.sql_always_where_calc_double_deps_after_substitutions[asName]) {
              x.sql_always_where_calc_double_deps_after_substitutions[asName] = {};
            }
            x.sql_always_where_calc_double_deps_after_substitutions[asName][depName] =
              x.sql_always_where_calc_line_num;
            break;
          }
        }

      }
    }

    x.sql_always_where_calc_real = sqlAlwaysWhereCalcReal;
  });

  return item.models;
}
