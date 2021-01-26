import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';

export function applyFilter(item: {
  filterFieldsConditions: interfaces.VarsSql['filterFieldsConditions'];
  as: string;
  input: string;
}) {
  let { filterFieldsConditions, as, input } = item;

  let reg = api.MyRegex.APPLY_FILTER();
  let r;

  while ((r = reg.exec(input))) {
    let start = r[1];
    let f = r[2];
    let target = r[3];
    let end = r[4];

    let filterName = `${as}.${f}`;

    let conditions = helper.isDefined(filterFieldsConditions[filterName])
      ? filterFieldsConditions[filterName]
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
