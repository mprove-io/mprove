import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fractionMonthNameValueValues = [
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
  (typeof fractionMonthNameValueValues)[number];

export let zFractionMonthNameValue = z.enum(fractionMonthNameValueValues);

assertTypesEqual<
  FractionMonthNameValue,
  z.infer<typeof zFractionMonthNameValue>
>({
  value: true
});
