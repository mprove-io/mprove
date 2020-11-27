import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barJoinSqlOn } from '../../barrels/bar-join-sql-on';

export function joinSqlOnBuild(item: {
  models: interfaces.Model[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barJoinSqlOn.jsoCheckCharsInRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoinSqlOn.jsoMakeDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoinSqlOn.jsoCheckDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoinSqlOn.jsoCheckSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoinSqlOn.jsoSubstituteSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoinSqlOn.jsoMakeJoinsDoubleDepsAfterSingles({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return models;
}
