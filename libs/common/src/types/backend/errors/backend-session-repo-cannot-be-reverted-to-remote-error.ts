import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionRepoCannotBeRevertedToRemoteError = {
  code: 'BACKEND_SESSION_REPO_CANNOT_BE_REVERTED_TO_REMOTE';
};

export let zBackendSessionRepoCannotBeRevertedToRemoteError = z.object({
  code: z.literal('BACKEND_SESSION_REPO_CANNOT_BE_REVERTED_TO_REMOTE')
});

assertTypesEqual<
  BackendSessionRepoCannotBeRevertedToRemoteError,
  z.infer<typeof zBackendSessionRepoCannotBeRevertedToRemoteError>
>({ value: true });
