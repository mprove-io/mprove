import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ThrottlerError = {
  code: 'THROTTLER_ERROR';
};

export let zThrottlerError = z.object({
  code: z.literal('THROTTLER_ERROR')
});

assertTypesEqual<ThrottlerError, z.infer<typeof zThrottlerError>>({
  value: true
});
