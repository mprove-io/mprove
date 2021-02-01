import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.JsoMakeJoinsDoubleDepsAfterSingles;

export function jsoMakeJoinsDoubleDepsAfterSingles(
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
    x.joinsDoubleDepsAfterSingles = {};

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        x.joinsDoubleDepsAfterSingles[join.as] = {};

        let sqlOnReal = join.sqlOnReal;

        let r;
        let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();

        while ((r = reg.exec(sqlOnReal))) {
          let asName: string = r[1];
          let dep: string = r[2];

          if (
            helper.isUndefined(x.joinsDoubleDepsAfterSingles[join.as][asName])
          ) {
            x.joinsDoubleDepsAfterSingles[join.as][asName] = {};
          }

          x.joinsDoubleDepsAfterSingles[join.as][asName][dep] = 1;
        }
      });
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
