import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetBranchesListOutput,
  zToBackendGetBranchesListOutput
} from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-output';
import {
  type ToBackendGetBranchesListError,
  zToBackendGetBranchesListError
} from './get-branches-list-error';

export type ToBackendGetBranchesListResponse = ToBackendResponseBase<
  'getBranchesList',
  ToBackendGetBranchesListOutput,
  ToBackendGetBranchesListError
>;

export let zToBackendGetBranchesListResponse = makeToBackendResponseSchema({
  operation: 'getBranchesList',
  output: zToBackendGetBranchesListOutput,
  error: zToBackendGetBranchesListError
}).meta({ id: 'ToBackendGetBranchesListResponse' });

assertTypesEqual<
  ToBackendGetBranchesListResponse,
  z.infer<typeof zToBackendGetBranchesListResponse>
>({ value: true });
