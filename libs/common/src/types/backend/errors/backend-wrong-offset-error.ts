import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongOffsetError = {
  code: 'BACKEND_WRONG_OFFSET';
};

export let zBackendWrongOffsetError = z.object({
  code: z.literal('BACKEND_WRONG_OFFSET')
});

assertTypesEqual<
  BackendWrongOffsetError,
  z.infer<typeof zBackendWrongOffsetError>
>({ value: true });
