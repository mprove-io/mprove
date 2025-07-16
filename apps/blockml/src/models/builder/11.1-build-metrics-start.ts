import { ConfigService } from '@nestjs/config';
import { barMetricsStart } from '~blockml/barrels/bar-metrics-start';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildMetricsStart(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { models } = item;

  models = barMetricsStart.checkModelBuildMetrics(
    {
      models: models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return {
    models: models
  };
}
