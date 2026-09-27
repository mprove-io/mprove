import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateBranchError,
  zToBackendCreateBranchError
} from './create-branch-error';

export type ToBackendCreateBranchOutput = Record<string, never>;

export type ToBackendCreateBranchResponse = ToBackendResponse<
  ToBackendCreateBranchOutput,
  ToBackendCreateBranchError
>;

export let zToBackendCreateBranchOutput = z
  .object({})
  .meta({ id: 'ToBackendCreateBranchOutput' });

export let zToBackendCreateBranchResponse = makeToBackendResponseSchema({
  success: zToBackendCreateBranchOutput,
  error: zToBackendCreateBranchError
}).meta({ id: 'ToBackendCreateBranchResponse' });

assertTypesEqual<
  ToBackendCreateBranchOutput,
  z.infer<typeof zToBackendCreateBranchOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateBranchResponse,
  z.infer<typeof zToBackendCreateBranchResponse>
>({ value: true });
