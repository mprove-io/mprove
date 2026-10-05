import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fieldTypeValues = [
  'count_distinct',

  'sum',
  'sum_by_key',

  'average',
  'average_by_key',

  'median_by_key',
  'percentile_by_key',
  'min',
  'max',
  'list',
  'custom',
  'yesno_is_true'
] as const;

export type FieldType = (typeof fieldTypeValues)[number];

export let zFieldType = z.enum(fieldTypeValues);

assertTypesEqual<FieldType, z.infer<typeof zFieldType>>({
  value: true
});
