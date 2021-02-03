import { ConfigService } from '@nestjs/config';
import { barJoin } from '~blockml/barrels/bar-join';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildJoin(
  item: {
    models: interfaces.Model[];
    structId: string;
    errors: BmError[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let models = item.models;

  models = barJoin.checkJoinUnknownParameters(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoin.checkJoinType(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoin.checkSqlOnExist(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoin.checkJoinHideShowFields(
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
