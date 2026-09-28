import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserApiKeyRequestNotAllowedError = {
  code: 'BACKEND_USER_API_KEY_REQUEST_NOT_ALLOWED';
};

export let zBackendUserApiKeyRequestNotAllowedError = z.object({
  code: z.literal('BACKEND_USER_API_KEY_REQUEST_NOT_ALLOWED')
});

assertTypesEqual<
  BackendUserApiKeyRequestNotAllowedError,
  z.infer<typeof zBackendUserApiKeyRequestNotAllowedError>
>({ value: true });
