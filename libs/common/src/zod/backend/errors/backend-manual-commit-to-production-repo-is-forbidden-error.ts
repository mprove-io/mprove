import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendManualCommitToProductionRepoIsForbiddenError = {
  code: 'BACKEND_MANUAL_COMMIT_TO_PRODUCTION_REPO_IS_FORBIDDEN';
};

export let zBackendManualCommitToProductionRepoIsForbiddenError = z.object({
  code: z.literal('BACKEND_MANUAL_COMMIT_TO_PRODUCTION_REPO_IS_FORBIDDEN')
});

assertTypesEqual<
  BackendManualCommitToProductionRepoIsForbiddenError,
  z.infer<typeof zBackendManualCommitToProductionRepoIsForbiddenError>
>({ value: true });
