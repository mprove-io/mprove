import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendBranchDoesNotExistError = {
  code: 'BACKEND_BRANCH_DOES_NOT_EXIST';
};

export let zBackendBranchDoesNotExistError = z.object({
  code: z.literal('BACKEND_BRANCH_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendBranchDoesNotExistError,
  z.infer<typeof zBackendBranchDoesNotExistError>
>({ value: true });
