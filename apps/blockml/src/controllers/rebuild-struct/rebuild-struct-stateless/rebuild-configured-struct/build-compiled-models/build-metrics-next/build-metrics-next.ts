import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { Model } from '#common/zod/blockml/model';
import type { ModelMetric } from '#common/zod/blockml/model-metric';
import { createModelMetrics } from './create-model-metrics/create-model-metrics';

export function buildMetricsNext(item: {
  apiModels: Model[];
  stores: FileStore[];
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
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
