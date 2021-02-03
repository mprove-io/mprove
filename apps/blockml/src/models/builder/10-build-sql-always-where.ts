import { ConfigService } from '@nestjs/config';
import { barSqlAlwaysWhere } from '~blockml/barrels/bar-sql-always-where';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildSqlAlwaysWhere(
  item: {
    models: interfaces.Model[];
    structId: string;
    errors: BmError[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let models = item.models;

  models = barSqlAlwaysWhere.sawCheckCharsInRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhere.sawMakeDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhere.sawCheckDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhere.sawCheckSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhere.sawSubstituteSingleRefs(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhere.sawMakeDoubleDepsAfterSingles(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhere.sawCheckApplyFilter(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barSqlAlwaysWhere.sawUpdateAlwaysJoinUnique(
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
