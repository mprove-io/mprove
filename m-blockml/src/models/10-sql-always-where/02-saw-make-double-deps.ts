import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.SawMakeDoubleDeps;

export function sawMakeDoubleDeps(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let { caller, structId, cs } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.sqlAlwaysWhereDoubleDeps = {};

    if (helper.isUndefined(x.sql_always_where)) {
      return;
    }

    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();
    let r;

    while ((r = reg.exec(x.sql_always_where))) {
      let as: string = r[1];
      let dep: string = r[2];

      if (helper.isUndefined(x.sqlAlwaysWhereDoubleDeps[as])) {
        x.sqlAlwaysWhereDoubleDeps[as] = {};
      }

      x.sqlAlwaysWhereDoubleDeps[as][dep] = x.sql_always_where_line_num;
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
