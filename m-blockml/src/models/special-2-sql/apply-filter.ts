import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';

export function applyFilter(
  item: interfaces.VarsSql,
  as: string,
  input: string
) {
  let reg = api.MyRegex.APPLY_FILTER();
  let r;

  while ((r = reg.exec(input))) {
    let start = r[1];
    let f = r[2];
    let target = r[3];
    let end = r[4];

    let filterName = `${as}.${f}`;

    let conditions = item.filtersConditions[filterName]
      ? item.filtersConditions[filterName]
      : item.untouchedFiltersConditions[filterName]
      ? item.untouchedFiltersConditions[filterName]
      : [];

    let conditionsString =
      conditions.length > 0
        ? conditions.join('\n')
        : `'empty filter ${as}.${f} applied' = 'empty filter ${as}.${f} applied'`;

    conditionsString = api.MyRegex.replaceMproveFilter(
      conditionsString,
      target
    );

    input = start + conditionsString + end;
  }

  input = api.MyRegex.removeLastN(input);

  return input;
}
