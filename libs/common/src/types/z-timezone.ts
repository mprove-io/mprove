import { z } from 'zod';
import { isTimezoneValid } from '#common/functions/is-timezone-valid/is-timezone-valid';

export let zTimezone = z
  .string()
  .refine(isTimezoneValid, { message: 'Wrong timezone' });
