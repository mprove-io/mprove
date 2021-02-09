import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function applyFilter(item: {
  filterFieldsConditions: interfaces.VarsSql['filterFieldsConditions'];
  as: string;
  input: string;
}) {
  let { filterFieldsConditions, as, input } = item;

  let reg = common.MyRegex.APPLY_FILTER();
  let r;

  while ((r = reg.exec(input))) {
    let start = r[1];
    let f = r[2];
    let target = r[3];
    let end = r[4];

    let filterName = `${as}.${f}`;

    let conditions = common.isDefined(filterFieldsConditions[filterName])
      ? filterFieldsConditions[filterName]
      : [];

    let conditionsString =
      conditions.length > 0
        ? conditions.join('\n')
        : `'empty filter ${as}.${f} applied' = 'empty filter ${as}.${f} applied'`;

    conditionsString = common.MyRegex.replaceMproveFilter(
      conditionsString,
      target
    );

    input = start + conditionsString + end;
  }

  input = common.MyRegex.removeLastN(input);

  return input;
}
