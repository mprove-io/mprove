import { ConfigService } from '@nestjs/config';
import { barSortJoins } from '~/barrels/bar-sort-joins';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

export function buildSortJoins(
  item: {
    models: interfaces.Model[];
    structId: string;
    errors: BmError[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let models = item.models;

  models = barSortJoins.checkJoinsCyclesAndToposort(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSortJoins.checkAlwaysJoin(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return models;
}
