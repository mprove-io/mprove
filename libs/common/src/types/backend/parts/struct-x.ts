import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelMetricX,
  zModelMetricX
} from '#common/types/backend/parts/model-metric-x';
import { type Struct, zStruct } from '#common/types/backend/parts/struct';
import type { Extend } from '#common/types/extend';

export type StructX = Extend<Struct, { metrics: ModelMetricX[] }>;

export let zStructX = zStruct
  .extend({
    metrics: z.array(zModelMetricX)
  })
  .meta({ id: 'StructX' });

assertTypesEqual<StructX, z.infer<typeof zStructX>>({ value: true });
