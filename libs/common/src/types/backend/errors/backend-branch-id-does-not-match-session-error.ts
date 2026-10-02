import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendBranchIdDoesNotMatchSessionError = {
  code: 'BACKEND_BRANCH_ID_DOES_NOT_MATCH_SESSION';
};

export let zBackendBranchIdDoesNotMatchSessionError = z.object({
  code: z.literal('BACKEND_BRANCH_ID_DOES_NOT_MATCH_SESSION')
});

assertTypesEqual<
  BackendBranchIdDoesNotMatchSessionError,
  z.infer<typeof zBackendBranchIdDoesNotMatchSessionError>
>({ value: true });
