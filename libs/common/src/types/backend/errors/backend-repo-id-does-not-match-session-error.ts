import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRepoIdDoesNotMatchSessionError = {
  code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION';
};

export let zBackendRepoIdDoesNotMatchSessionError = z.object({
  code: z.literal('BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION')
});

assertTypesEqual<
  BackendRepoIdDoesNotMatchSessionError,
  z.infer<typeof zBackendRepoIdDoesNotMatchSessionError>
>({ value: true });
