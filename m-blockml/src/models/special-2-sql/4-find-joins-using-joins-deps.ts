import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.FindJoinsUsingJoinsDeps;

export function findJoinsUsingJoinsDeps(item: {
  needsDoubles: interfaces.VarsSql['needsDoubles'];
  varsSqlElements: interfaces.Report['varsSqlElements'];
  model: interfaces.Model;
}) {
  let { needsDoubles, varsSqlElements, model } = item;

  let varsSqlInput: interfaces.VarsSql = helper.makeCopy({ needsDoubles });

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
          if (!joins[depAs]) {
            joins[depAs] = 1;
            restart = true;
          }
        });
    });
  }

  joins[model.fromAs] = 1;

  let output: interfaces.VarsSql = { joins };

  varsSqlElements.push({
    func: func,
    varsSqlInput: varsSqlInput,
    varsSqlOutput: output
  });

  return output;
}
