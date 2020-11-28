import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSortJoins } from '../../barrels/bar-sort-joins';

export function buildSortJoins(item: {
  models: interfaces.Model[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barSortJoins.checkJoinsCyclesAndToposort({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSortJoins.checkAlwaysJoin({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return models;
}
