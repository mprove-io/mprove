import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.SawMakeDoubleDepsAfterSingles;

export function sawMakeDoubleDepsAfterSingles(
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
    x.sqlAlwaysWhereDoubleDepsAfterSingles = {};

    if (common.isUndefined(x.sql_always_where)) {
      return;
    }

    if (common.isUndefined(x.sql_always_where)) {
      return;
    }

    let reg = common.MyRegex.CAPTURE_DOUBLE_REF_G();
    let r;

    while ((r = reg.exec(x.sqlAlwaysWhereReal))) {
      let asName: string = r[1];
      let dep: string = r[2];

      if (common.isUndefined(x.sqlAlwaysWhereDoubleDepsAfterSingles[asName])) {
        x.sqlAlwaysWhereDoubleDepsAfterSingles[asName] = {};
      }

      x.sqlAlwaysWhereDoubleDepsAfterSingles[asName][dep] = 1;
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
