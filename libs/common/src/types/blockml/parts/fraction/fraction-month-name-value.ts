import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

// sorted
export const fractionMonthNameValueValuesSorted = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export type FractionMonthNameValue =
  (typeof fractionMonthNameValueValuesSorted)[number];

export let zFractionMonthNameValue = z.enum(fractionMonthNameValueValuesSorted);

assertTypesEqual<
  FractionMonthNameValue,
  z.infer<typeof zFractionMonthNameValue>
>({
  value: true
});
