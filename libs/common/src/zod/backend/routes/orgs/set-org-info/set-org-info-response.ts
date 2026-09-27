import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/zod/backend/org';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetOrgInfoError,
  zToBackendSetOrgInfoError
} from './set-org-info-error';

export type ToBackendSetOrgInfoOutput = {
  org: Org;
};

export type ToBackendSetOrgInfoResponse = ToBackendResponse<
  ToBackendSetOrgInfoOutput,
  ToBackendSetOrgInfoError
>;

export let zToBackendSetOrgInfoOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendSetOrgInfoOutput' });

export let zToBackendSetOrgInfoResponse = makeToBackendResponseSchema({
  success: zToBackendSetOrgInfoOutput,
  error: zToBackendSetOrgInfoError
}).meta({ id: 'ToBackendSetOrgInfoResponse' });

assertTypesEqual<
  ToBackendSetOrgInfoOutput,
  z.infer<typeof zToBackendSetOrgInfoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetOrgInfoResponse,
  z.infer<typeof zToBackendSetOrgInfoResponse>
>({ value: true });
