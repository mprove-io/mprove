import { ConfigService } from '@nestjs/config';
import { barSqlAlwaysWhereCalc } from '~blockml/barrels/bar-sql-always-where-calc';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildSqlAlwaysWhereCalc(
  item: {
    models: common.FileModel[];
    structId: string;
    errors: BmError[];
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let models = item.models;

  models = barSqlAlwaysWhereCalc.awcCheckCharsInRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhereCalc.awcMakeDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhereCalc.awcCheckDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhereCalc.awcCheckSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhereCalc.awcSubstituteSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhereCalc.awcMakeDoubleDepsAfterSubstitutions(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhereCalc.awcCheckApplyFilter(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhereCalc.awcUpdateAlwaysJoinUnique(
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
