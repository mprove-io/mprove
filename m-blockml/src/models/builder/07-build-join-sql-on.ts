import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barJoinSqlOn } from '../../barrels/bar-join-sql-on';
import { ConfigService } from '@nestjs/config';

export function buildJoinSqlOn(
  item: {
    models: interfaces.Model[];
    structId: string;
    errors: BmError[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let models = item.models;

  models = barJoinSqlOn.jsoCheckCharsInRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlOn.jsoMakeDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlOn.jsoCheckDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlOn.jsoCheckSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlOn.jsoSubstituteSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlOn.jsoMakeJoinsDoubleDepsAfterSingles(
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
