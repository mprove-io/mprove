import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteBranchOutput,
  zToBackendDeleteBranchOutput
} from '#common/types/backend/routes/branches/delete-branch/delete-branch-output';
import {
  type ToBackendDeleteBranchError,
  zToBackendDeleteBranchError
} from './delete-branch-error';

export type ToBackendDeleteBranchResponse = ToBackendResponseBase<
  'deleteBranch',
  ToBackendDeleteBranchOutput,
  ToBackendDeleteBranchError
>;

export let zToBackendDeleteBranchResponse = makeToBackendResponseSchema({
  operation: 'deleteBranch',
  output: zToBackendDeleteBranchOutput,
  error: zToBackendDeleteBranchError
}).meta({ id: 'ToBackendDeleteBranchResponse' });

assertTypesEqual<
  ToBackendDeleteBranchResponse,
  z.infer<typeof zToBackendDeleteBranchResponse>
>({ value: true });
