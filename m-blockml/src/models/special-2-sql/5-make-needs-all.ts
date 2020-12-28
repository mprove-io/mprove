import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';

let func = enums.FuncEnum.MakeNeedsAll;

export function makeNeedsAll(item: {
  needsDoubles: interfaces.VarsSql['needsDoubles'];
  joins: interfaces.VarsSql['joins'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { needsDoubles, joins, varsSqlSteps, model } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSql>({
    needsDoubles,
    joins
  });

  let needsAll = helper.makeCopy(item.needsDoubles);

  Object.keys(joins)
    .filter(alias => alias !== model.fromAs)
    .forEach(alias => {
      Object.keys(model.joinsDoubleDepsAfterSingles[alias]).forEach(asName => {
        Object.keys(model.joinsDoubleDepsAfterSingles[alias][asName]).forEach(
          dep => {
            if (!needsAll[asName]) {
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
