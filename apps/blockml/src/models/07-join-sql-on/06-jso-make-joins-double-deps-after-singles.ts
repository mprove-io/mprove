import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.JsoMakeJoinsDoubleDepsAfterSingles;

export function jsoMakeJoinsDoubleDepsAfterSingles(
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
    x.joinsDoubleDepsAfterSingles = {};

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        x.joinsDoubleDepsAfterSingles[join.as] = {};

        let sqlOnReal = join.sqlOnReal;

        let r;
        let reg = common.MyRegex.CAPTURE_DOUBLE_REF_G();

        while ((r = reg.exec(sqlOnReal))) {
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
