import { z } from 'zod';
import { zModelMetric } from '#common/types/blockml/parts/model-metric';

export let zModelMetricX = zModelMetric
  .extend({
    hasAccessToModel: z.boolean()
  })
  .meta({ id: 'ModelMetricX' });

export type ModelMetricX = z.infer<typeof zModelMetricX>;
