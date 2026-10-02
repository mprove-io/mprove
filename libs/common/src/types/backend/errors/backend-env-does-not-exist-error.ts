import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEnvDoesNotExistError = {
  code: 'BACKEND_ENV_DOES_NOT_EXIST';
};

export let zBackendEnvDoesNotExistError = z.object({
  code: z.literal('BACKEND_ENV_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendEnvDoesNotExistError,
  z.infer<typeof zBackendEnvDoesNotExistError>
>({ value: true });
