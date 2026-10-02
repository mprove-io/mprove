import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionBranchCannotBeMergedError = {
  code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_MERGED';
};

export let zBackendSessionBranchCannotBeMergedError = z.object({
  code: z.literal('BACKEND_SESSION_BRANCH_CANNOT_BE_MERGED')
});

assertTypesEqual<
  BackendSessionBranchCannotBeMergedError,
  z.infer<typeof zBackendSessionBranchCannotBeMergedError>
>({ value: true });
