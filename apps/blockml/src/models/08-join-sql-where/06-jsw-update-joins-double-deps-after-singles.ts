import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.JswUpdateJoinsDoubleDepsAfterSingles;

export function jswUpdateJoinsDoubleDepsAfterSingles(
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
        if (common.isUndefined(join.sqlWhereReal)) {
          return;
        }

        let reg = common.MyRegex.CAPTURE_DOUBLE_REF_G();
        let r;

        while ((r = reg.exec(join.sqlWhereReal))) {
          let asName: string = r[1];
          let dep: string = r[2];

          if (
            common.isUndefined(x.joinsDoubleDepsAfterSingles[join.as][asName])
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
