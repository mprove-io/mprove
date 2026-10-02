import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCodexAuthTokenExpiresInIsTooShortError = {
  code: 'BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_TOO_SHORT';
};

export let zBackendCodexAuthTokenExpiresInIsTooShortError = z.object({
  code: z.literal('BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_TOO_SHORT')
});

assertTypesEqual<
  BackendCodexAuthTokenExpiresInIsTooShortError,
  z.infer<typeof zBackendCodexAuthTokenExpiresInIsTooShortError>
>({ value: true });
