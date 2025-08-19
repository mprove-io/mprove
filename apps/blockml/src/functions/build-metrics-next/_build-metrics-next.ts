import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

export function buildMetricsNext(
  item: {
    apiModels: Model[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { apiModels, stores } = item;

  let metrics: ModelMetric[] = createModelMetrics(
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
