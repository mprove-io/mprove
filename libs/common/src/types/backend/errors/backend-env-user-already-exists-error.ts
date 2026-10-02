import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEnvUserAlreadyExistsError = {
  code: 'BACKEND_ENV_USER_ALREADY_EXISTS';
};

export let zBackendEnvUserAlreadyExistsError = z.object({
  code: z.literal('BACKEND_ENV_USER_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendEnvUserAlreadyExistsError,
  z.infer<typeof zBackendEnvUserAlreadyExistsError>
>({ value: true });
