import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEnvIdDoesNotMatchSessionError = {
  code: 'BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION';
};

export let zBackendEnvIdDoesNotMatchSessionError = z.object({
  code: z.literal('BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION')
});

assertTypesEqual<
  BackendEnvIdDoesNotMatchSessionError,
  z.infer<typeof zBackendEnvIdDoesNotMatchSessionError>
>({ value: true });
