import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionBranchCannotBeCreatedError = {
  code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_CREATED';
};

export let zBackendSessionBranchCannotBeCreatedError = z.object({
  code: z.literal('BACKEND_SESSION_BRANCH_CANNOT_BE_CREATED')
});

assertTypesEqual<
  BackendSessionBranchCannotBeCreatedError,
  z.infer<typeof zBackendSessionBranchCannotBeCreatedError>
>({ value: true });
