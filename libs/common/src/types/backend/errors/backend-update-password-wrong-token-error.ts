import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUpdatePasswordWrongTokenError = {
  code: 'BACKEND_UPDATE_PASSWORD_WRONG_TOKEN';
};

export let zBackendUpdatePasswordWrongTokenError = z.object({
  code: z.literal('BACKEND_UPDATE_PASSWORD_WRONG_TOKEN')
});

assertTypesEqual<
  BackendUpdatePasswordWrongTokenError,
  z.infer<typeof zBackendUpdatePasswordWrongTokenError>
>({ value: true });
