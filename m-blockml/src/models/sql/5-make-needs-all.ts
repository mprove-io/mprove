import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';

export function makeNeedsAll(item: interfaces.VarsSql) {
  let needsAll = helper.makeCopy(item.needsDoubles);

  Object.keys(item.joins)
    .filter(alias => alias !== item.model.fromAs)
    .forEach(alias => {
      Object.keys(item.model.joinsDoubleDepsAfterSingles[alias]).forEach(
        asName => {
          Object.keys(
            item.model.joinsDoubleDepsAfterSingles[alias][asName]
          ).forEach(dep => {
            if (!needsAll[asName]) {
              needsAll[asName] = {};
            }
            needsAll[asName][dep] = 1;
          });
        }
      );
    });

  item.needsAll = needsAll;

  return item;
}
