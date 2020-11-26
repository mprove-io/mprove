import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.UpgradeJoinCalculationsForceDims;

export function upgradeJoinCalculationsForceDims(item: {
  models: interfaces.Model[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  item.models.forEach(x => {
    x.joins.forEach(join => {
      join.view.fields.forEach(field => {
        if (field.fieldClass === enums.FieldClassEnum.Calculation) {
          field.forceDims = {};

          Object.keys(field.prepForceDims).forEach(dimName => {
            if (!field.forceDims[join.as]) {
              field.forceDims[join.as] = {};
            }

            field.forceDims[join.as][dimName] = field.prepForceDims[dimName];
          });
        }
      });
    });
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, item.models);

  return item.models;
}
