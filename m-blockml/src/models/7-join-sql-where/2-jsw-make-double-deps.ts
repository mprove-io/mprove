import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.JswMakeDoubleDeps;

export function jswMakeDoubleDeps(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        join.sqlWhereDoubleDeps = {};

        if (helper.isUndefined(join.sql_where)) {
          return;
        }

        let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();
        let r;

        while ((r = reg.exec(join.sql_where))) {
          let as: string = r[1];
          let dep: string = r[2];

          if (!join.sqlWhereDoubleDeps[as]) {
            join.sqlWhereDoubleDeps[as] = {};
          }

          join.sqlWhereDoubleDeps[as][dep] = join.sql_where_line_num;
        }
      });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
