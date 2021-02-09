import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.FindJoinsUsingJoinsDeps;

export function findJoinsUsingJoinsDeps(item: {
  needsDoubles: interfaces.VarsSql['needsDoubles'];
  varsSqlSteps: interfaces.Report['varsSqlSteps'];
  model: interfaces.Model;
}) {
  let { needsDoubles, varsSqlSteps, model } = item;

  let varsInput = common.makeCopy<interfaces.VarsSql>({ needsDoubles });

  let joins: interfaces.VarsSql['joins'] = {};

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

  let varsOutput: interfaces.VarsSql = { joins };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
