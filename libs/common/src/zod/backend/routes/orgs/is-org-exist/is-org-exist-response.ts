import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendIsOrgExistError,
  zToBackendIsOrgExistError
} from './is-org-exist-error';

export type ToBackendIsOrgExistOutput = {
  isExist: boolean;
};

export type ToBackendIsOrgExistResponse = ToBackendResponse<
  ToBackendIsOrgExistOutput,
  ToBackendIsOrgExistError
>;

export let zToBackendIsOrgExistOutput = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsOrgExistOutput' });

export let zToBackendIsOrgExistResponse = makeToBackendResponseSchema({
  success: zToBackendIsOrgExistOutput,
  error: zToBackendIsOrgExistError
}).meta({ id: 'ToBackendIsOrgExistResponse' });

assertTypesEqual<
  ToBackendIsOrgExistOutput,
  z.infer<typeof zToBackendIsOrgExistOutput>
>({ value: true });

assertTypesEqual<
  ToBackendIsOrgExistResponse,
  z.infer<typeof zToBackendIsOrgExistResponse>
>({ value: true });
