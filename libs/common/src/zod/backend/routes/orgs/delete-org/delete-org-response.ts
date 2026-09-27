import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteOrgError,
  zToBackendDeleteOrgError
} from './delete-org-error';

export type ToBackendDeleteOrgOutput = Record<string, never>;

export type ToBackendDeleteOrgResponse = ToBackendResponse<
  ToBackendDeleteOrgOutput,
  ToBackendDeleteOrgError
>;

export let zToBackendDeleteOrgOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteOrgOutput' });

export let zToBackendDeleteOrgResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteOrgOutput,
  error: zToBackendDeleteOrgError
}).meta({ id: 'ToBackendDeleteOrgResponse' });

assertTypesEqual<
  ToBackendDeleteOrgOutput,
  z.infer<typeof zToBackendDeleteOrgOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteOrgResponse,
  z.infer<typeof zToBackendDeleteOrgResponse>
>({ value: true });
