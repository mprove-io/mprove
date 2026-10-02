import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionBranchCannotBeDeletedError = {
  code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_DELETED';
};

export let zBackendSessionBranchCannotBeDeletedError = z.object({
  code: z.literal('BACKEND_SESSION_BRANCH_CANNOT_BE_DELETED')
});

assertTypesEqual<
  BackendSessionBranchCannotBeDeletedError,
  z.infer<typeof zBackendSessionBranchCannotBeDeletedError>
>({ value: true });
