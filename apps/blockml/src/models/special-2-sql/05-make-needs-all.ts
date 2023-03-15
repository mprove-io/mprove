import { common } from '~blockml/barrels/common';

let func = common.FuncEnum.MakeNeedsAll;

export function makeNeedsAll(item: {
  needsDoubles: common.VarsSql['needsDoubles'];
  joins: common.VarsSql['joins'];
  varsSqlSteps: common.FileReport['varsSqlSteps'];
  model: common.FileModel;
}) {
  let { needsDoubles, joins, varsSqlSteps, model } = item;

  let varsInput = common.makeCopy<common.VarsSql>({
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

  let varsOutput: common.VarsSql = { needsAll };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
