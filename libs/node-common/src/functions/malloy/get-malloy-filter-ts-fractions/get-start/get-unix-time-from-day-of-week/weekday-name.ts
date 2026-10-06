import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const weekdayNameValues = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
] as const;

export type WeekdayName = (typeof weekdayNameValues)[number];

export let zWeekdayName = z.enum(weekdayNameValues);

assertTypesEqual<WeekdayName, z.infer<typeof zWeekdayName>>({
  value: true
});
