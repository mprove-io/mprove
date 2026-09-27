import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/zod/backend/org';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetOrgOwnerError,
  zToBackendSetOrgOwnerError
} from './set-org-owner-error';

export type ToBackendSetOrgOwnerOutput = {
  org: Org;
};

export type ToBackendSetOrgOwnerResponse = ToBackendResponse<
  ToBackendSetOrgOwnerOutput,
  ToBackendSetOrgOwnerError
>;

export let zToBackendSetOrgOwnerOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendSetOrgOwnerOutput' });

export let zToBackendSetOrgOwnerResponse = makeToBackendResponseSchema({
  success: zToBackendSetOrgOwnerOutput,
  error: zToBackendSetOrgOwnerError
}).meta({ id: 'ToBackendSetOrgOwnerResponse' });

assertTypesEqual<
  ToBackendSetOrgOwnerOutput,
  z.infer<typeof zToBackendSetOrgOwnerOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetOrgOwnerResponse,
  z.infer<typeof zToBackendSetOrgOwnerResponse>
>({ value: true });
