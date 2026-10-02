import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type TooManyRequestsError = {
  code: 'TOO_MANY_REQUESTS_ERROR';
};

export let zTooManyRequestsError = z.object({
  code: z.literal('TOO_MANY_REQUESTS_ERROR')
});

assertTypesEqual<TooManyRequestsError, z.infer<typeof zTooManyRequestsError>>({
  value: true
});
