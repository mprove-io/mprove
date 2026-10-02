import { z } from 'zod';
import { zModelMetricX } from '#common/types/backend/model-metric-x';
import { zStruct } from '#common/types/backend/struct';

export let zStructX = zStruct
  .extend({
    metrics: z.array(zModelMetricX)
  })
  .meta({ id: 'StructX' });

export type StructX = z.infer<typeof zStructX>;
