import { ConfigService } from '@nestjs/config';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.AwcUpdateAlwaysJoinUnique;

export function awcUpdateAlwaysJoinUnique(
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
    if (helper.isUndefined(x.sql_always_where_calc)) {
      return;
    }

    Object.keys(x.sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions).forEach(
      as => {
        x.alwaysJoinUnique[as] = 1;
      }
    );
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
