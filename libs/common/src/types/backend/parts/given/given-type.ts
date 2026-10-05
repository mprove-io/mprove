import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const givenTypeValues = [
  'String',
  'Number',
  'Boolean',
  'Date',
  'Timestamp'
  // TimestampTz = 'TimestampTz'
] as const;

export type GivenType = (typeof givenTypeValues)[number];

export let zGivenType = z.enum(givenTypeValues);

assertTypesEqual<GivenType, z.infer<typeof zGivenType>>({
  value: true
});
