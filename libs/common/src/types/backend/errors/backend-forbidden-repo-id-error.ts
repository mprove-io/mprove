import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendForbiddenRepoIdError = {
  code: 'BACKEND_FORBIDDEN_REPO_ID';
};

export let zBackendForbiddenRepoIdError = z.object({
  code: z.literal('BACKEND_FORBIDDEN_REPO_ID')
});

assertTypesEqual<
  BackendForbiddenRepoIdError,
  z.infer<typeof zBackendForbiddenRepoIdError>
>({ value: true });
