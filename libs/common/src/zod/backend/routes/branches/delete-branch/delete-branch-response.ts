import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteBranchError,
  zToBackendDeleteBranchError
} from './delete-branch-error';

export type ToBackendDeleteBranchOutput = Record<string, never>;

export type ToBackendDeleteBranchResponse = ToBackendResponse<
  ToBackendDeleteBranchOutput,
  ToBackendDeleteBranchError
>;

export let zToBackendDeleteBranchOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteBranchOutput' });

export let zToBackendDeleteBranchResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteBranchOutput,
  error: zToBackendDeleteBranchError
}).meta({ id: 'ToBackendDeleteBranchResponse' });

assertTypesEqual<
  ToBackendDeleteBranchOutput,
  z.infer<typeof zToBackendDeleteBranchOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteBranchResponse,
  z.infer<typeof zToBackendDeleteBranchResponse>
>({ value: true });
