import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type StateMetricItem = { metricId: string; name: string };

export let zStateMetricItem = z
  .object({
    metricId: z.string(),
    name: z.string()
  })
  .meta({ id: 'StateMetricItem' });

assertTypesEqual<StateMetricItem, z.infer<typeof zStateMetricItem>>({
  value: true
});
