import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSignUpToSetPasswordError = {
  code: 'BACKEND_SIGN_UP_TO_SET_PASSWORD';
};

export let zBackendSignUpToSetPasswordError = z.object({
  code: z.literal('BACKEND_SIGN_UP_TO_SET_PASSWORD')
});

assertTypesEqual<
  BackendSignUpToSetPasswordError,
  z.infer<typeof zBackendSignUpToSetPasswordError>
>({ value: true });
