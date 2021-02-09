import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.AwcMakeDoubleDepsAfterSubstitutions;

export function awcMakeDoubleDepsAfterSubstitutions(
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
    x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions = {};

    if (common.isUndefined(x.sql_always_where_calc)) {
      return;
    }

    let sqlAlwaysWhereCalcReal = x.sqlAlwaysWhereCalcReal;

    // substitute DOUBLE calculations
    let restart2 = true;

    while (restart2) {
      restart2 = false;

      let reg2 = common.MyRegex.CAPTURE_DOUBLE_REF_G(); // g works because of restart
      let r2;

      while ((r2 = reg2.exec(sqlAlwaysWhereCalcReal))) {
        let asName = r2[1];
        let depName = r2[2];

        let join = x.joins.find(j => j.as === asName);

        let depField = join.view.fields.find(f => f.name === depName);

        switch (true) {
          case depField.fieldClass ===
            apiToBlockml.FieldClassEnum.Calculation: {
            sqlAlwaysWhereCalcReal = common.MyRegex.replaceAndConvert(
              sqlAlwaysWhereCalcReal,
              depField.sqlReal,
              asName,
              depName
            );

            restart2 = true;
            break;
          }

          case depField.fieldClass === apiToBlockml.FieldClassEnum.Dimension: {
            if (
              common.isUndefined(
                x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName]
              )
            ) {
              x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName] = {};
            }
            x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName][depName] =
              x.sql_always_where_calc_line_num;
            break;
          }

          case depField.fieldClass === apiToBlockml.FieldClassEnum.Measure: {
            if (
              common.isUndefined(
                x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName]
              )
            ) {
              x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName] = {};
            }
            x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName][depName] =
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
