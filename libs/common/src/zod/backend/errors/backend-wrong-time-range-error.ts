import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongTimeRangeError = {
  code: 'BACKEND_WRONG_TIME_RANGE';
};

export let zBackendWrongTimeRangeError = z.object({
  code: z.literal('BACKEND_WRONG_TIME_RANGE')
});

assertTypesEqual<
  BackendWrongTimeRangeError,
  z.infer<typeof zBackendWrongTimeRangeError>
>({ value: true });
