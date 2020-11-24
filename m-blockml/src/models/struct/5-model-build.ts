import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../../models/bm-error';
import { interfaces } from '../../barrels/interfaces';
import { barModel } from '../../barrels/bar-model';

export function modelBuild(item: {
  models: interfaces.Model[];
  views: interfaces.View[];
  udfs: interfaces.Udf[];
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  projectId: string;
  structId: string;
  caller: enums.CallerEnum;
}) {
  let models = item.models;

  models = barModel.checkModelAccessUsers({
    models: models,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.checkModelUdfs({
    models: models,
    udfs: item.udfs,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.checkJoinsExist({
    models: models,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.checkJoinsFromView({
    models: models,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.checkAliases({
    models: models,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.makeJoins({
    models: models,
    views: item.views,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.upgradeMfCalcForceDims({
    models: models,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.makeFieldsDoubleDeps({
    models: models,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  models = barModel.checkFieldsDoubleDeps({
    models: models,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  // models = barModel.afterDoubleCheckFieldsDeps({ models: models });

  // // substitute double calc with restart #add doubles to 'force_dims'
  // models = barModel.makeFieldsDoubleDepsAfterSingles({ models: models });

  // models = barModel.checkModelFiltersFromField({ models: models });

  // // ApFilter
  // models = barFilter.checkVMDFilterDefaults({
  //   entities: models,
  //   weekStart: item.weekStart,
  //   connection: item.connection
  // });

  return models;
}
