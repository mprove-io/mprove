import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fractionDayOfWeekValueValues = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export type FractionDayOfWeekValue =
  (typeof fractionDayOfWeekValueValues)[number];

export let zFractionDayOfWeekValue = z.enum(fractionDayOfWeekValueValues);

assertTypesEqual<
  FractionDayOfWeekValue,
  z.infer<typeof zFractionDayOfWeekValue>
>({
  value: true
});
