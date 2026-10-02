import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateBranchOutput,
  zToBackendCreateBranchOutput
} from '#common/types/backend/routes/branches/create-branch/create-branch-output';
import {
  type ToBackendCreateBranchError,
  zToBackendCreateBranchError
} from './create-branch-error';

export type ToBackendCreateBranchResponse = ToBackendResponseBase<
  'createBranch',
  ToBackendCreateBranchOutput,
  ToBackendCreateBranchError
>;

export let zToBackendCreateBranchResponse = makeToBackendResponseSchema({
  operation: 'createBranch',
  output: zToBackendCreateBranchOutput,
  error: zToBackendCreateBranchError
}).meta({ id: 'ToBackendCreateBranchResponse' });

assertTypesEqual<
  ToBackendCreateBranchResponse,
  z.infer<typeof zToBackendCreateBranchResponse>
>({ value: true });
