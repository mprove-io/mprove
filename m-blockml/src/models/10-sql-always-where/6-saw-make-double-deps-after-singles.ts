import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.SawMakeDoubleDepsAfterSingles;

export function sawMakeDoubleDepsAfterSingles(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    if (helper.isUndefined(x.sql_always_where)) {
      return;
    }

    x.sqlAlwaysWhereDoubleDepsAfterSingles = {};

    if (helper.isUndefined(x.sql_always_where)) {
      return;
    }

    let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();
    let r;

    while ((r = reg.exec(x.sqlAlwaysWhereReal))) {
      let asName: string = r[1];
      let dep: string = r[2];

      if (helper.isUndefined(x.sqlAlwaysWhereDoubleDepsAfterSingles[asName])) {
        x.sqlAlwaysWhereDoubleDepsAfterSingles[asName] = {};
      }

      x.sqlAlwaysWhereDoubleDepsAfterSingles[asName][dep] = 1;
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
