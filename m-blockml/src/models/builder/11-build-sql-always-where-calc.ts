import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barSqlAlwaysWhereCalc } from '../../barrels/bar-sql-always-where-calc';

export function buildSqlAlwaysWhereCalc(item: {
  models: interfaces.Model[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barSqlAlwaysWhereCalc.awcCheckCharsInRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhereCalc.awcMakeDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhereCalc.awcCheckDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhereCalc.awcCheckSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhereCalc.awcSubstituteSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhereCalc.awcMakeDoubleDepsAfterSubstitutions({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhereCalc.awcCheckApplyFilter({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barSqlAlwaysWhereCalc.awcUpdateAlwaysJoinUnique({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return models;
}
