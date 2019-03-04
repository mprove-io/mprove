import { interfaces } from '../../barrels/interfaces';

export function makeNeedsAll(item: interfaces.Vars) {
  let needsAll = JSON.parse(JSON.stringify(item.needs_doubles));

  Object.keys(item.joins)
    .filter(alias => alias !== item.model.from_as)
    .forEach(alias => {
      Object.keys(item.model.joins_double_deps_after_singles[alias]).forEach(
        asName => {
          Object.keys(
            item.model.joins_double_deps_after_singles[alias][asName]
          ).forEach(dep => {
            if (!needsAll[asName]) {
              needsAll[asName] = {};
            }
            needsAll[asName][dep] = 1;
          });
        }
      );
    });

  item.needs_all = needsAll;

  return item;
}
