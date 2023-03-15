import { ConfigService } from '@nestjs/config';
import { barSortJoins } from '~blockml/barrels/bar-sort-joins';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildSortJoins(
  item: {
    models: common.FileModel[];
    structId: string;
    errors: BmError[];
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
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
