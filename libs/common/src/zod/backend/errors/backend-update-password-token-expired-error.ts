import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUpdatePasswordTokenExpiredError = {
  code: 'BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED';
};

export let zBackendUpdatePasswordTokenExpiredError = z.object({
  code: z.literal('BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED')
});

assertTypesEqual<
  BackendUpdatePasswordTokenExpiredError,
  z.infer<typeof zBackendUpdatePasswordTokenExpiredError>
>({ value: true });
