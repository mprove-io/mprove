import { ConfigService } from '@nestjs/config';
import { barMetricsNext } from '~blockml/barrels/bar-metrics-next';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildMetricsNext(
  item: {
    apiModels: common.Model[];
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { apiModels, stores } = item;

  let metrics: common.ModelMetric[] = barMetricsNext.createModelMetrics(
    {
      apiModels: apiModels,
      stores: stores,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return {
    metrics: metrics
  };
}
