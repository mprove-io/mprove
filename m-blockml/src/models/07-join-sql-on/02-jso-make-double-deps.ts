import { helper } from '~/barrels/helper';
import { enums } from '~/barrels/enums';
import { api } from '~/barrels/api';
import { BmError } from '~/models/bm-error';
import { interfaces } from '~/barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.JsoMakeDoubleDeps;

export function jsoMakeDoubleDeps(
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
    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        join.sqlOnDoubleDeps = {};

        let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();
        let r;

        while ((r = reg.exec(join.sql_on))) {
          let as: string = r[1];
          let dep: string = r[2];

          if (helper.isUndefined(join.sqlOnDoubleDeps[as])) {
            join.sqlOnDoubleDeps[as] = {};
          }

          join.sqlOnDoubleDeps[as][dep] = join.sql_on_line_num;
        }
      });
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
