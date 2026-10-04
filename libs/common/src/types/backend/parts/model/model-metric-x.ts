import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelMetric,
  zModelMetric
} from '#common/types/blockml/parts/model/model-metric';
import type { Extend } from '#common/types/extend';

export type ModelMetricX = Extend<ModelMetric, { hasAccessToModel: boolean }>;

export let zModelMetricX = zModelMetric
  .extend({
    hasAccessToModel: z.boolean()
  })
  .meta({ id: 'ModelMetricX' });

assertTypesEqual<ModelMetricX, z.infer<typeof zModelMetricX>>({ value: true });
