import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSqlAlwaysWhere } from '../../barrels/bar-sql-always-where';

export function buildSqlAlwaysWhere(item: {
  models: interfaces.Model[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barSqlAlwaysWhere.sawCheckCharsInRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhere.sawMakeDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhere.sawCheckDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhere.sawCheckSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhere.sawSubstituteSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhere.sawMakeDoubleDepsAfterSingles({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  // models = barModelSqlAlwaysWhere.checkApplyFilter({ models: models });

  return models;
}
