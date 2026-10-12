import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProjectIdDoesNotMatchSessionError = {
  code: 'BACKEND_PROJECT_ID_DOES_NOT_MATCH_SESSION';
};

export let zBackendProjectIdDoesNotMatchSessionError = z.object({
  code: z.literal('BACKEND_PROJECT_ID_DOES_NOT_MATCH_SESSION')
});

assertTypesEqual<
  BackendProjectIdDoesNotMatchSessionError,
  z.infer<typeof zBackendProjectIdDoesNotMatchSessionError>
>({ value: true });
