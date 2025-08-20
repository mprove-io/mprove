import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { createModelMetrics } from './create-model-metrics';

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
