import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { Caller } from '#common/types/blockml/diagnostics/caller';

import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import { createModelMetrics } from './create-model-metrics/create-model-metrics';

export function buildMetricsNext(item: {
  apiModels: Model[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<ModelMetric[], never> {
  let { apiModels, stores, cs } = item;

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

  return Result.succeed(metrics);
}
