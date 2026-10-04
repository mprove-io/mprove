import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fractionTsMomentTypeValues = [
  'Literal',
  'Today',
  'Yesterday',
  'Tomorrow',
  'This',
  'Last',
  'Next',
  'Ago',
  'FromNow',
  'Now',
  'Timestamp'
] as const;

export type FractionTsMomentType = (typeof fractionTsMomentTypeValues)[number];

export let zFractionTsMomentType = z.enum(fractionTsMomentTypeValues);

assertTypesEqual<FractionTsMomentType, z.infer<typeof zFractionTsMomentType>>({
  value: true
});
