import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendIsBranchExistOutput,
  zToBackendIsBranchExistOutput
} from '#common/zod/backend/routes/branches/is-branch-exist/is-branch-exist-output';
import {
  type ToBackendIsBranchExistError,
  zToBackendIsBranchExistError
} from './is-branch-exist-error';

export type ToBackendIsBranchExistResponse = ToBackendResponseBase<
  'isBranchExist',
  ToBackendIsBranchExistOutput,
  ToBackendIsBranchExistError
>;

export let zToBackendIsBranchExistResponse = makeToBackendResponseSchema({
  operation: 'isBranchExist',
  output: zToBackendIsBranchExistOutput,
  error: zToBackendIsBranchExistError
}).meta({ id: 'ToBackendIsBranchExistResponse' });

assertTypesEqual<
  ToBackendIsBranchExistResponse,
  z.infer<typeof zToBackendIsBranchExistResponse>
>({ value: true });
