import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.AwcMakeDoubleDeps;

export function awcMakeDoubleDeps(
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
    x.sqlAlwaysWhereCalcDoubleDeps = {};

    if (common.isUndefined(x.sql_always_where_calc)) {
      return;
    }

    let reg = common.MyRegex.CAPTURE_DOUBLE_REF_G();
    let r;

    while ((r = reg.exec(x.sql_always_where_calc))) {
      let as: string = r[1];
      let dep: string = r[2];

      if (common.isUndefined(x.sqlAlwaysWhereCalcDoubleDeps[as])) {
        x.sqlAlwaysWhereCalcDoubleDeps[as] = {};
      }

      x.sqlAlwaysWhereCalcDoubleDeps[as][dep] =
        x.sql_always_where_calc_line_num;
    }
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
