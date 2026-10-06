import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const pivotAggValues = [
  'sum',
  'avg',
  'count',
  'min',
  'max',
  'first',
  'last'
] as const;

export type PivotAgg = (typeof pivotAggValues)[number];

export let zPivotAgg = z.enum(pivotAggValues);

assertTypesEqual<PivotAgg, z.infer<typeof zPivotAgg>>({
  value: true
});
