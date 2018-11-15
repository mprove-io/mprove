import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function applyFilter(item: interfaces.Vars, as: string, input: string) {
  let reg = ApRegex.APPLY_FILTER();
  let r;

  while ((r = reg.exec(input))) {
    let start = r[1];
    let f = r[2];
    let target = r[3];
    let end = r[4];

    let filterName = `${as}.${f}`;

    let conditions = item.filters_conditions[filterName]
      ? item.filters_conditions[filterName]
      : item.untouched_filters_conditions[filterName]
      ? item.untouched_filters_conditions[filterName]
      : [];

    let conditionsString =
      conditions.length > 0
        ? conditions.join(`\n`)
        : `'empty filter ${as}.${f} applied' = 'empty filter ${as}.${f} applied'`;

    conditionsString = ApRegex.replaceMproveFilter(conditionsString, target);

    input = start + conditionsString + end;
  }

  input = ApRegex.removeLastN(input);

  return input;
}
