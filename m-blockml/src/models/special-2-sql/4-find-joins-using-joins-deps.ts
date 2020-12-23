import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

export function findJoinsUsingJoinsDeps(item: interfaces.VarsSql) {
  let joins: { [s: string]: number } = {};

  [
    ...Object.keys(item.needsDoubles),
    ...Object.keys(item.model.alwaysJoinUnique)
  ]
    .filter(asName => asName !== item.model.fromAs && asName !== constants.MF)
    .forEach(asName => {
      joins[asName] = 1;
    });

  let restart = true;

  while (restart) {
    restart = false;

    Object.keys(joins).forEach(asName => {
      Object.keys(item.model.joinsDoubleDepsAfterSingles[asName])
        .filter(depAs => depAs !== item.model.fromAs && depAs !== constants.MF)
        .forEach(depAs => {
          if (!joins[depAs]) {
            joins[depAs] = 1;
            restart = true;
          }
        });
    });
  }

  joins[item.model.fromAs] = 1;

  item.joins = joins;

  return item;
}
