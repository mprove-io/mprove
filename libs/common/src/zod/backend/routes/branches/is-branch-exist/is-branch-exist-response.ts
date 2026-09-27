import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendIsBranchExistError,
  zToBackendIsBranchExistError
} from './is-branch-exist-error';

export type ToBackendIsBranchExistOutput = {
  isExist: boolean;
};

export type ToBackendIsBranchExistResponse = ToBackendResponse<
  ToBackendIsBranchExistOutput,
  ToBackendIsBranchExistError
>;

export let zToBackendIsBranchExistOutput = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsBranchExistOutput' });

export let zToBackendIsBranchExistResponse = makeToBackendResponseSchema({
  success: zToBackendIsBranchExistOutput,
  error: zToBackendIsBranchExistError
}).meta({ id: 'ToBackendIsBranchExistResponse' });

assertTypesEqual<
  ToBackendIsBranchExistOutput,
  z.infer<typeof zToBackendIsBranchExistOutput>
>({ value: true });

assertTypesEqual<
  ToBackendIsBranchExistResponse,
  z.infer<typeof zToBackendIsBranchExistResponse>
>({ value: true });
