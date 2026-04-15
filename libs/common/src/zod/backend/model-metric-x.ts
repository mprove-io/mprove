import { z } from 'zod';
import { zModelMetric } from '#common/zod/blockml/model-metric';

export let zModelMetricX = zModelMetric
  .extend({
    hasAccessToModel: z.boolean()
  })
  .meta({ id: 'ModelMetricX' });

export type ModelMetricX = z.infer<typeof zModelMetricX>;
