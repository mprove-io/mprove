import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let func = common.FuncEnum.FindJoinsUsingJoinsDeps;

export function findJoinsUsingJoinsDeps(item: {
  needsDoubles: common.VarsSql['needsDoubles'];
  varsSqlSteps: common.FilePartTile['varsSqlSteps'];
  model: common.FileModel;
}) {
  let { needsDoubles, varsSqlSteps, model } = item;

  let varsInput = common.makeCopy<common.VarsSql>({ needsDoubles });

  let joins: common.VarsSql['joins'] = {};

  [...Object.keys(needsDoubles), ...Object.keys(model.alwaysJoinUnique)]
    .filter(asName => asName !== model.fromAs && asName !== constants.MF)
    .forEach(asName => {
      joins[asName] = 1;
    });

  let restart = true;

  while (restart) {
    restart = false;

    Object.keys(joins).forEach(asName => {
      Object.keys(model.joinsDoubleDepsAfterSingles[asName])
        .filter(depAs => depAs !== model.fromAs && depAs !== constants.MF)
        .forEach(depAs => {
          if (common.isUndefined(joins[depAs])) {
            joins[depAs] = 1;
            restart = true;
          }
        });
    });
  }

  joins[model.fromAs] = 1;

  let varsOutput: common.VarsSql = { joins };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
