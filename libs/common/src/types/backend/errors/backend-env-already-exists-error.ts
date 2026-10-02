import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEnvAlreadyExistsError = {
  code: 'BACKEND_ENV_ALREADY_EXISTS';
};

export let zBackendEnvAlreadyExistsError = z.object({
  code: z.literal('BACKEND_ENV_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendEnvAlreadyExistsError,
  z.infer<typeof zBackendEnvAlreadyExistsError>
>({ value: true });
