import { ConfigService } from '@nestjs/config';
import { barMetric } from '~blockml/barrels/bar-metric';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildMetric(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let modelMetrics: common.ModelMetric[] = barMetric.createModelMetrics(
    {
      models: item.models,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let metrics: common.MetricAny[] = [...modelMetrics];

  return metrics;
}
