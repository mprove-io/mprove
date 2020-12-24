import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';

let func = enums.FuncEnum.MakeNeedsAll;

export function makeNeedsAll(item: {
  needsDoubles: interfaces.VarsSql['needsDoubles'];
  joins: interfaces.VarsSql['joins'];
  varsSqlElements: interfaces.Report['varsSqlElements'];
  model: interfaces.Model;
}) {
  let { needsDoubles, joins, varsSqlElements, model } = item;

  let varsSqlInput: interfaces.VarsSql = helper.makeCopy({
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

  let output: interfaces.VarsSql = { needsAll };

  varsSqlElements.push({
    func: func,
    varsSqlInput: varsSqlInput,
    varsSqlOutput: output
  });

  return output;
}
