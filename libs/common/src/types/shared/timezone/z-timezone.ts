import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { isTimezoneValid } from '#common/functions/is-timezone-valid/is-timezone-valid';

export type TimezoneString = string;

export let zTimezone = z
  .string()
  .refine(isTimezoneValid, { message: 'Wrong timezone' });

assertTypesEqual<TimezoneString, z.infer<typeof zTimezone>>({ value: true });
