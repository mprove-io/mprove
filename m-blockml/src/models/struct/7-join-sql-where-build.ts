import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barJoinSqlWhere } from '../../barrels/bar-join-sql-where';

export function joinSqlWhereBuild(item: {
  models: interfaces.Model[];
  structId: string;
  errors: BmError[];
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barJoinSqlWhere.jswCheckCharsInRefs({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoinSqlWhere.jswMakeDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barJoinSqlWhere.jswCheckDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  // models = barJoinSqlWhere.checkSingleRefs({ models: models });
  // models = barJoinSqlWhere.substituteSingleRefs({ models: models });
  // models = barJoinSqlWhere.updateJoinsDoubleDepsAfterSingles({
  //   models: models
  // });
  // models = barJoinSqlWhere.checkApplyFilter({ models: models });
  return models;
}
