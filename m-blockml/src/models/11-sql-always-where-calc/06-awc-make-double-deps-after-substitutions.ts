import { helper } from '~/barrels/helper';
import { enums } from '~/barrels/enums';
import { api } from '~/barrels/api';
import { BmError } from '~/models/bm-error';
import { interfaces } from '~/barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.AwcMakeDoubleDepsAfterSubstitutions;

export function awcMakeDoubleDepsAfterSubstitutions(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions = {};

    if (helper.isUndefined(x.sql_always_where_calc)) {
      return;
    }

    let sqlAlwaysWhereCalcReal = x.sqlAlwaysWhereCalcReal;

    // substitute DOUBLE calculations
    let restart2 = true;

    while (restart2) {
      restart2 = false;

      let reg2 = api.MyRegex.CAPTURE_DOUBLE_REF_G(); // g works because of restart
      let r2;

      while ((r2 = reg2.exec(sqlAlwaysWhereCalcReal))) {
        let asName = r2[1];
        let depName = r2[2];

        let join = x.joins.find(j => j.as === asName);

        let depField = join.view.fields.find(f => f.name === depName);

        switch (true) {
          case depField.fieldClass === api.FieldClassEnum.Calculation: {
            sqlAlwaysWhereCalcReal = api.MyRegex.replaceAndConvert(
              sqlAlwaysWhereCalcReal,
              depField.sqlReal,
              asName,
              depName
            );

            restart2 = true;
            break;
          }

          case depField.fieldClass === api.FieldClassEnum.Dimension: {
            if (
              helper.isUndefined(
                x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName]
              )
            ) {
              x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName] = {};
            }
            x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions[asName][depName] =
              x.sql_always_where_calc_line_num;
            break;
          }

          case depField.fieldClass === api.FieldClassEnum.Measure: {
            if (
              helper.isUndefined(
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
