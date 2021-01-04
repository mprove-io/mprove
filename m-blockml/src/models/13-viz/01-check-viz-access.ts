import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSpecial } from '../../barrels/bar-special';

let func = enums.FuncEnum.CheckVizAccess;

export function checkVizAccess(item: {
  vizs: interfaces.Viz[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newVizs = barSpecial.checkMdzAccess({
    entities: item.vizs,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Vizs, newVizs);

  return newVizs;
}
