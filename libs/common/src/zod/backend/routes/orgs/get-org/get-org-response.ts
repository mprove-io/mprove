import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/zod/backend/org';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetOrgError,
  zToBackendGetOrgError
} from './get-org-error';

export type ToBackendGetOrgOutput = {
  org: Org;
};

export type ToBackendGetOrgResponse = ToBackendResponse<
  ToBackendGetOrgOutput,
  ToBackendGetOrgError
>;

export let zToBackendGetOrgOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendGetOrgOutput' });

export let zToBackendGetOrgResponse = makeToBackendResponseSchema({
  success: zToBackendGetOrgOutput,
  error: zToBackendGetOrgError
}).meta({ id: 'ToBackendGetOrgResponse' });

assertTypesEqual<ToBackendGetOrgOutput, z.infer<typeof zToBackendGetOrgOutput>>(
  { value: true }
);

assertTypesEqual<
  ToBackendGetOrgResponse,
  z.infer<typeof zToBackendGetOrgResponse>
>({ value: true });
