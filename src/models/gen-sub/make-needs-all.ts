import { interfaces } from '../../barrels/interfaces';

export function makeNeedsAll(item: interfaces.VarsSub) {

  let needsAll: { [a: string]: number } = {};

  Object.keys(item.selected).forEach(fieldName => {
    needsAll[fieldName] = 1;

    Object.keys(item.view.fields_deps_after_singles[fieldName]).forEach(dep => {
      needsAll[dep] = 1;
    });
  });

  item.needs_all = needsAll;

  return item;
}
