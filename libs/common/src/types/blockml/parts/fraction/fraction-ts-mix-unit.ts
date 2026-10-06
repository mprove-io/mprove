import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fractionTsMixUnitValues = [
  'second',
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'quarter',
  'year',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

export type FractionTsMixUnit = (typeof fractionTsMixUnitValues)[number];

export let zFractionTsMixUnit = z.enum(fractionTsMixUnitValues);

assertTypesEqual<FractionTsMixUnit, z.infer<typeof zFractionTsMixUnit>>({
  value: true
});
