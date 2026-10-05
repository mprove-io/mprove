import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const detailUnitValues = [
  'timestamps',
  'minutes',
  'hours',
  'days',
  'weeksSunday',
  'weeksMonday',
  'months',
  'quarters',
  'years'
] as const;

export type DetailUnit = (typeof detailUnitValues)[number];

export let zDetailUnit = z.enum(detailUnitValues);

assertTypesEqual<DetailUnit, z.infer<typeof zDetailUnit>>({
  value: true
});
