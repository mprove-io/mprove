import { enums } from '~/barrels/enums';
import { BmError } from '~/models/bm-error';
import { interfaces } from '~/barrels/interfaces';
import { barSortJoins } from '~/barrels/bar-sort-joins';
import { ConfigService } from '@nestjs/config';

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
