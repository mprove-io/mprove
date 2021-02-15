import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.AwcSubstituteSingleRefs;

export function awcSubstituteSingleRefs(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.sqlAlwaysWhereCalcDepsAfterSingles = {};

    if (common.isUndefined(x.sql_always_where_calc)) {
      return;
    }

    let sqlAlwaysWhereCalcReal = x.sql_always_where_calc;

    // substitute SINGLE calculations
    let restartSingles = true;

    while (restartSingles) {
      restartSingles = false;

      let reg = common.MyRegex.CAPTURE_SINGLE_REF_G(); // g works because of restart
      let r;

      while ((r = reg.exec(sqlAlwaysWhereCalcReal))) {
        let fieldName = r[1];
        let referenceField = x.fields.find(f => f.name === fieldName);

        switch (true) {
          case referenceField.fieldClass ===
            common.FieldClassEnum.Calculation: {
            // referenceField.sqlReal
            // ${calc1}   >>>   (${dim2} + ${b.order_items_total} + ${mea1})
            sqlAlwaysWhereCalcReal = common.MyRegex.replaceSingleRefs(
              sqlAlwaysWhereCalcReal,
              fieldName,
              referenceField.sqlReal
            );

            restartSingles = true;
            break;
          }

          case referenceField.fieldClass === common.FieldClassEnum.Dimension: {
            x.sqlAlwaysWhereCalcDepsAfterSingles[fieldName] =
              x.sql_always_where_calc_line_num;
            break;
          }

          case referenceField.fieldClass === common.FieldClassEnum.Measure: {
            x.sqlAlwaysWhereCalcDepsAfterSingles[fieldName] =
              x.sql_always_where_calc_line_num;
            break;
          }
        }
      }
    }

    x.sqlAlwaysWhereCalcReal = sqlAlwaysWhereCalcReal;
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
