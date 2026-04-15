import { z } from 'zod';
import { zModelMetricX } from '#common/zod/backend/model-metric-x';
import { zStruct } from '#common/zod/backend/struct';

export let zStructX = zStruct
  .extend({
    metrics: z.array(zModelMetricX)
  })
  .meta({ id: 'StructX' });

export type StructX = z.infer<typeof zStructX>;
