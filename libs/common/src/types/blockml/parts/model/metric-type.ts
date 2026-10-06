import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const metricTypeValues = ['Model'] as const;

export type MetricType = (typeof metricTypeValues)[number];

export let zMetricType = z.enum(metricTypeValues);

assertTypesEqual<MetricType, z.infer<typeof zMetricType>>({
  value: true
});
