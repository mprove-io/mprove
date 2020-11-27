import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barJoin } from '../../barrels/bar-join';

export function joinBuild(item: {
  models: interfaces.Model[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barJoin.checkJoinUnknownParameters({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.checkJoinType({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.upgradeJoinCalculationsForceDims({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.checkSqlOnExist({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.checkCharsInSqlOnRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.makeJoinsDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.checkJoinsDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.checkSqlOnSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoin.substituteSqlOnSingleRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  // and joinsPreparedDeps
  models = barJoin.makeJoinsDoubleDepsAfterSingles({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return models;
}