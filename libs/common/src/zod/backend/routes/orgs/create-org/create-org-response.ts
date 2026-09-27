import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/zod/backend/org';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateOrgError,
  zToBackendCreateOrgError
} from './create-org-error';

export type ToBackendCreateOrgOutput = {
  org: Org;
};

export type ToBackendCreateOrgResponse = ToBackendResponse<
  ToBackendCreateOrgOutput,
  ToBackendCreateOrgError
>;

export let zToBackendCreateOrgOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendCreateOrgOutput' });

export let zToBackendCreateOrgResponse = makeToBackendResponseSchema({
  success: zToBackendCreateOrgOutput,
  error: zToBackendCreateOrgError
}).meta({ id: 'ToBackendCreateOrgResponse' });

assertTypesEqual<
  ToBackendCreateOrgOutput,
  z.infer<typeof zToBackendCreateOrgOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateOrgResponse,
  z.infer<typeof zToBackendCreateOrgResponse>
>({ value: true });
