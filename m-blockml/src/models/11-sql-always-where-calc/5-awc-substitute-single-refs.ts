import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.AwcSubstituteSingleRefs;

export function awcSubstituteSingleRefs(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.sqlAlwaysWhereCalcForceDims = {};
    x.sqlAlwaysWhereCalcDepsAfterSingles = {};

    if (helper.isUndefined(x.sql_always_where_calc)) {
      return;
    }

    let sqlAlwaysWhereCalcReal = x.sql_always_where_calc;

    // substitute SINGLE calculations
    let restartSingles = true;

    while (restartSingles) {
      restartSingles = false;

      let reg = api.MyRegex.CAPTURE_SINGLE_REF_G(); // g works because of restart
      let r;

      while ((r = reg.exec(sqlAlwaysWhereCalcReal))) {
        let fieldName = r[1];
        let referenceField = x.fields.find(f => f.name === fieldName);

        switch (true) {
          case referenceField.fieldClass === api.FieldClassEnum.Calculation: {
            // referenceField.sqlReal
            // ${calc1}   >>>   (${dim2} + ${b.order_items_total} + ${mea1})
            sqlAlwaysWhereCalcReal = api.MyRegex.replaceSingleRefs(
              sqlAlwaysWhereCalcReal,
              fieldName,
              referenceField.sqlReal
            );

            restartSingles = true;
            break;
          }

          case referenceField.fieldClass === api.FieldClassEnum.Dimension: {
            x.sqlAlwaysWhereCalcDepsAfterSingles[fieldName] =
              x.sql_always_where_calc_line_num;

            if (
              helper.isUndefined(x.sqlAlwaysWhereCalcForceDims[constants.MF])
            ) {
              x.sqlAlwaysWhereCalcForceDims[constants.MF] = {};
            }

            x.sqlAlwaysWhereCalcForceDims[constants.MF][fieldName] =
              x.sql_always_where_calc_line_num;

            break;
          }

          case referenceField.fieldClass === api.FieldClassEnum.Measure: {
            x.sqlAlwaysWhereCalcDepsAfterSingles[fieldName] =
              x.sql_always_where_calc_line_num;
            break;
          }
        }
      }
    }

    x.sqlAlwaysWhereCalcReal = sqlAlwaysWhereCalcReal;
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
