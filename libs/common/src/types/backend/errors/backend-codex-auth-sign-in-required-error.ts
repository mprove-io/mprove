import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCodexAuthSignInRequiredError = {
  code: 'BACKEND_CODEX_AUTH_SIGN_IN_REQUIRED';
};

export let zBackendCodexAuthSignInRequiredError = z.object({
  code: z.literal('BACKEND_CODEX_AUTH_SIGN_IN_REQUIRED')
});

assertTypesEqual<
  BackendCodexAuthSignInRequiredError,
  z.infer<typeof zBackendCodexAuthSignInRequiredError>
>({ value: true });
