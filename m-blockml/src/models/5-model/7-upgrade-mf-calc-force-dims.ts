import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.UpgradeMfCalcForceDims;

export function upgradeMfCalcForceDims(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.fields.forEach(f => {
      if (f.fieldClass === enums.FieldClassEnum.Calculation) {
        f.forceDims = {};

        Object.keys(f.prepForceDims).forEach(dimName => {
          if (helper.isDefined(f.forceDims['mf'])) {
            f.forceDims['mf'][dimName] = f.prepForceDims[dimName];
          } else {
            f.forceDims['mf'] = {
              [dimName]: f.prepForceDims[dimName]
            };
          }
        });
      }
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
