import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSqlAlwaysWhere } from '../../barrels/bar-sql-always-where';
import { ConfigService } from '@nestjs/config';

export function buildSqlAlwaysWhere(item: {
  models: interfaces.Model[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let models = item.models;

  models = barSqlAlwaysWhere.sawCheckCharsInRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  models = barSqlAlwaysWhere.sawMakeDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  models = barSqlAlwaysWhere.sawCheckDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  models = barSqlAlwaysWhere.sawCheckSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  models = barSqlAlwaysWhere.sawSubstituteSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  models = barSqlAlwaysWhere.sawMakeDoubleDepsAfterSingles({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  models = barSqlAlwaysWhere.sawCheckApplyFilter({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  models = barSqlAlwaysWhere.sawUpdateAlwaysJoinUnique({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  return models;
}
