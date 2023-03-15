import { ConfigService } from '@nestjs/config';
import { barJoin } from '~blockml/barrels/bar-join';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildJoin(
  item: {
    models: common.FileModel[];
    structId: string;
    errors: BmError[];
    caller: common.CallerEnum;
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
