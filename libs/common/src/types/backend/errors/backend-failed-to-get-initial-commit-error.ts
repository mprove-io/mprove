import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendFailedToGetInitialCommitError = {
  code: 'BACKEND_FAILED_TO_GET_INITIAL_COMMIT';
};

export let zBackendFailedToGetInitialCommitError = z.object({
  code: z.literal('BACKEND_FAILED_TO_GET_INITIAL_COMMIT')
});

assertTypesEqual<
  BackendFailedToGetInitialCommitError,
  z.infer<typeof zBackendFailedToGetInitialCommitError>
>({ value: true });
