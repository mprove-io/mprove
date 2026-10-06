import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

// lowercase
export const fieldClassValues = [
  'dimension',
  'time',
  'measure',
  'calculation',
  'filter',
  // for nodeClass:
  'join',
  'info'
] as const;

export type FieldClass = (typeof fieldClassValues)[number];

export let zFieldClass = z.enum(fieldClassValues);

assertTypesEqual<FieldClass, z.infer<typeof zFieldClass>>({
  value: true
});
