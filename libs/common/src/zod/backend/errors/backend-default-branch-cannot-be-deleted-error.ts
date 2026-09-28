import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDefaultBranchCannotBeDeletedError = {
  code: 'BACKEND_DEFAULT_BRANCH_CANNOT_BE_DELETED';
};

export let zBackendDefaultBranchCannotBeDeletedError = z.object({
  code: z.literal('BACKEND_DEFAULT_BRANCH_CANNOT_BE_DELETED')
});

assertTypesEqual<
  BackendDefaultBranchCannotBeDeletedError,
  z.infer<typeof zBackendDefaultBranchCannotBeDeletedError>
>({ value: true });
