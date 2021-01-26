import { ConfigService } from '@nestjs/config';
import { barJoinSqlWhere } from '~/barrels/bar-join-sql-where';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

export function buildJoinSqlWhere(
  item: {
    models: interfaces.Model[];
    structId: string;
    errors: BmError[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let models = item.models;

  models = barJoinSqlWhere.jswCheckCharsInRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlWhere.jswMakeDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlWhere.jswCheckDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlWhere.jswCheckSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlWhere.jswSubstituteSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlWhere.jswUpdateJoinsDoubleDepsAfterSingles(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barJoinSqlWhere.jswCheckApplyFilter(
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
