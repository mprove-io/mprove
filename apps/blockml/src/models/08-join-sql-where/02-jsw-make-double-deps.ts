import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.JswMakeDoubleDeps;

export function jswMakeDoubleDeps(
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

          if (helper.isUndefined(join.sqlWhereDoubleDeps[as])) {
            join.sqlWhereDoubleDeps[as] = {};
          }

          join.sqlWhereDoubleDeps[as][dep] = join.sql_where_line_num;
        }
      });
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
