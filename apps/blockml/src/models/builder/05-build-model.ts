import { ConfigService } from '@nestjs/config';
import { barModel } from '~blockml/barrels/bar-model';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildModel(
  item: {
    models: interfaces.Model[];
    views: interfaces.View[];
    udfs: interfaces.Udf[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let models = item.models;

  models = barModel.checkModelAccess(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.checkModelUdfs(
    {
      models: models,
      udfs: item.udfs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.checkJoinsExist(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.checkJoinsFromView(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.checkAliases(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.makeJoins(
    {
      models: models,
      views: item.views,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.makeFieldsDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.checkFieldsDoubleDeps(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  // substitute double calculations with restart
  models = barModel.makeFieldsDoubleDepsAfterSingles(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  models = barModel.checkModelFilterDefaults(
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
