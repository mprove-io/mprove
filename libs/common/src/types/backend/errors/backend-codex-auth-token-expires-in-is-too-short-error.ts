import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCodexAuthTokenExpiresInIsTooShortError = {
  code: 'BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_TOO_SHORT';
  customData?: {
    expiresInSec: number;
    minExpiresInSec: number;
  };
};

export let zBackendCodexAuthTokenExpiresInIsTooShortError = z.object({
  code: z.literal('BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_TOO_SHORT'),
  customData: z
    .object({
      expiresInSec: z.number(),
      minExpiresInSec: z.number()
    })
    .nullish()
});

assertTypesEqual<
  BackendCodexAuthTokenExpiresInIsTooShortError,
  z.infer<typeof zBackendCodexAuthTokenExpiresInIsTooShortError>
>({ value: true });
