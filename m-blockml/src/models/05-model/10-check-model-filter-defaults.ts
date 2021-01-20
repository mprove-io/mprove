import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSpecial } from '../../barrels/bar-special';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.CheckModelFilterDefaults;

export function checkModelFilterDefaults(
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

  let newModels = barSpecial.checkVmdFilterDefaults(
    {
      entities: item.models,
      errors: item.errors,
      structId: item.structId,
      caller: item.caller
    },
    cs
  );

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
