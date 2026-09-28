import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionApiKeyRequestNotAllowedError = {
  code: 'BACKEND_SESSION_API_KEY_REQUEST_NOT_ALLOWED';
};

export let zBackendSessionApiKeyRequestNotAllowedError = z.object({
  code: z.literal('BACKEND_SESSION_API_KEY_REQUEST_NOT_ALLOWED')
});

assertTypesEqual<
  BackendSessionApiKeyRequestNotAllowedError,
  z.infer<typeof zBackendSessionApiKeyRequestNotAllowedError>
>({ value: true });
