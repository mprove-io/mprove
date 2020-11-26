import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.MakeJoinsDoubleDeps;

export function makeJoinsDoubleDeps(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.joinsDoubleDeps = {};

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        x.joinsDoubleDeps[join.as] = {};

        let r;
        let reg = api.MyRegex.CAPTURE_DOUBLE_REF_G();

        while ((r = reg.exec(join.sql_on))) {
          let as: string = r[1];
          let dep: string = r[2];

          if (!x.joinsDoubleDeps[join.as][as]) {
            x.joinsDoubleDeps[join.as][as] = {};
          }

          x.joinsDoubleDeps[join.as][as][dep] = join.sql_on_line_num;
        }
      });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
