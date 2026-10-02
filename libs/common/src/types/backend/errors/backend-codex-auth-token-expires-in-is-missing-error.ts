import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCodexAuthTokenExpiresInIsMissingError = {
  code: 'BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_MISSING';
};

export let zBackendCodexAuthTokenExpiresInIsMissingError = z.object({
  code: z.literal('BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_MISSING')
});

assertTypesEqual<
  BackendCodexAuthTokenExpiresInIsMissingError,
  z.infer<typeof zBackendCodexAuthTokenExpiresInIsMissingError>
>({ value: true });
