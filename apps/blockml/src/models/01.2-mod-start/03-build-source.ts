import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.BuildSource;

export function buildSource(
  item: {
    mods: common.FileMod[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newMods: common.FileMod[] = [];

  item.mods.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (errorsOnStart === item.errors.length) {
      newMods.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Mods, newMods);

  return newMods;
}
