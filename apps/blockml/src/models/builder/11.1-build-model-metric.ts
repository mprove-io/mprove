import { ConfigService } from '@nestjs/config';
import { barModelMetric } from '~blockml/barrels/bar-model-metric';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildModelMetric(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let models = item.models;

  models = barModelMetric.checkModelBuildMetrics(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let metrics: common.ModelMetric[] = barModelMetric.createModelMetrics(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return {
    models: models,
    metrics: metrics
  };
}
