import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.MakeNeedsAll;

export function makeNeedsAll(item: {
  needsDoubles: interfaces.VarsSql['needsDoubles'];
  joins: interfaces.VarsSql['joins'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { needsDoubles, joins, varsSqlSteps, model } = item;

  let varsInput = common.makeCopy<interfaces.VarsSql>({
    needsDoubles,
    joins
  });

  let needsAll = common.makeCopy(needsDoubles);

  Object.keys(joins)
    .filter(alias => alias !== model.fromAs)
    .forEach(alias => {
      Object.keys(model.joinsDoubleDepsAfterSingles[alias]).forEach(asName => {
        Object.keys(model.joinsDoubleDepsAfterSingles[alias][asName]).forEach(
          dep => {
            if (common.isUndefined(needsAll[asName])) {
              needsAll[asName] = {};
            }
            needsAll[asName][dep] = 1;
          }
        );
      });
    });

  let varsOutput: interfaces.VarsSql = { needsAll };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
