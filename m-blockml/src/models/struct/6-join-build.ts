import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
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

  // models = barJoin.checkJoinType({ models: models });

  // models = barJoin.upgradeJoinForceDims({ models: models });

  // models = barJoin.checkSqlOnExist({ models: models });
  // models = barJoin.checkCharsInSqlOnRefs({ models: models });
  // models = barJoin.makeJoinsDoubleDeps({ models: models });
  // models = barJoin.checkJoinsDoubleDeps({ models: models });

  // models = barJoin.checkSqlOnSingleRefs({ models: models });
  // models = barJoin.substituteSqlOnSingleRefs({ models: models });
  // // and joins_prepared_deps
  // models = barJoin.makeJoinsDoubleDepsAfterSingles({ models: models });

  return models;
}
