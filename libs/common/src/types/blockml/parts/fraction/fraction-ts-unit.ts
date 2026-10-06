import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fractionTsUnitValues = [
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'quarters',
  'years'
] as const;

export type FractionTsUnit = (typeof fractionTsUnitValues)[number];

export let zFractionTsUnit = z.enum(fractionTsUnitValues);

assertTypesEqual<FractionTsUnit, z.infer<typeof zFractionTsUnit>>({
  value: true
});
