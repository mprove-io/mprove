import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.AwcMakeDoubleDeps;

export function awcMakeDoubleDeps(
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
    x.sqlAlwaysWhereCalcDoubleDeps = {};

    if (helper.isUndefined(x.sql_always_where_calc)) {
      return;
    }

    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();
    let r;

    while ((r = reg.exec(x.sql_always_where_calc))) {
      let as: string = r[1];
      let dep: string = r[2];

      if (helper.isUndefined(x.sqlAlwaysWhereCalcDoubleDeps[as])) {
        x.sqlAlwaysWhereCalcDoubleDeps[as] = {};
      }

      x.sqlAlwaysWhereCalcDoubleDeps[as][dep] =
        x.sql_always_where_calc_line_num;
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
