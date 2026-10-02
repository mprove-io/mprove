import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendWrongPasswordError = {
  code: 'BACKEND_WRONG_PASSWORD';
};

export let zBackendWrongPasswordError = z.object({
  code: z.literal('BACKEND_WRONG_PASSWORD')
});

assertTypesEqual<
  BackendWrongPasswordError,
  z.infer<typeof zBackendWrongPasswordError>
>({ value: true });
