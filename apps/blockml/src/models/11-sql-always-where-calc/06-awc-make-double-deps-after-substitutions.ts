import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.AwcMakeDoubleDepsAfterSubstitutions;

export function awcMakeDoubleDepsAfterSubstitutions(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

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
          case depField.fieldClass === common.FieldClassEnum.Calculation: {
            sqlAlwaysWhereCalcReal = common.MyRegex.replaceAndConvert(
              sqlAlwaysWhereCalcReal,
              depField.sqlReal,
              asName,
              depName
            );

            restart2 = true;
            break;
          }

          case depField.fieldClass === common.FieldClassEnum.Dimension: {
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

          case depField.fieldClass === common.FieldClassEnum.Measure: {
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Models,
    item.models
  );

  return item.models;
}
