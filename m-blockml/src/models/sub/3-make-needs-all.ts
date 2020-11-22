import { interfaces } from '../../barrels/interfaces';

export function makeNeedsAll(item: interfaces.VarsSub) {
  let needsAll: { [a: string]: number } = {};

  Object.keys(item.selected).forEach(fieldName => {
    needsAll[fieldName] = 1;

    Object.keys(item.view.fieldsDepsAfterSingles[fieldName]).forEach(dep => {
      needsAll[dep] = 1;
    });
  });

  item.needsAll = needsAll;

  return item;
}
