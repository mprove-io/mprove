import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barModel } from '../../barrels/bar-model';

export function modelBuild(item: {
  models: interfaces.Model[];
  views: interfaces.View[];
  udfs: interfaces.Udf[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barModel.checkModelAccessUsers({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.checkModelUdfs({
    models: models,
    udfs: item.udfs,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.checkJoinsExist({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.checkJoinsFromView({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.checkAliases({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.makeJoins({
    models: models,
    views: item.views,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.upgradeMfCalcForceDims({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.makeFieldsDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.checkFieldsDoubleDeps({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  // substitute double calculations with restart
  // add doubles to forceDims
  models = barModel.makeFieldsDoubleDepsAfterSingles({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  models = barModel.checkModelFilterDefaults({
    models: models,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  return models;
}
