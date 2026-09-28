import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRepoIdDoesNotMatchUserError = {
  code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_USER';
};

export let zBackendRepoIdDoesNotMatchUserError = z.object({
  code: z.literal('BACKEND_REPO_ID_DOES_NOT_MATCH_USER')
});

assertTypesEqual<
  BackendRepoIdDoesNotMatchUserError,
  z.infer<typeof zBackendRepoIdDoesNotMatchUserError>
>({ value: true });
