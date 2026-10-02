import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendBranchAlreadyExistsError = {
  code: 'BACKEND_BRANCH_ALREADY_EXISTS';
};

export let zBackendBranchAlreadyExistsError = z.object({
  code: z.literal('BACKEND_BRANCH_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendBranchAlreadyExistsError,
  z.infer<typeof zBackendBranchAlreadyExistsError>
>({ value: true });
