import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const timeSpecValues = [
  'timestamps',
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'quarters',
  'years'
] as const;

export type TimeSpec = (typeof timeSpecValues)[number];

export let zTimeSpec = z.enum(timeSpecValues);

assertTypesEqual<TimeSpec, z.infer<typeof zTimeSpec>>({
  value: true
});
