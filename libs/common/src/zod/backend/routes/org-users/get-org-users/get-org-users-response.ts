import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OrgUsersItem,
  zOrgUsersItem
} from '#common/zod/backend/org-users/org-users-item';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetOrgUsersError,
  zToBackendGetOrgUsersError
} from './get-org-users-error';

export type ToBackendGetOrgUsersOutput = {
  orgUsersList: OrgUsersItem[];
  total: number;
};

export type ToBackendGetOrgUsersResponse = ToBackendResponse<
  ToBackendGetOrgUsersOutput,
  ToBackendGetOrgUsersError
>;

export let zToBackendGetOrgUsersOutput = z
  .object({
    orgUsersList: z.array(zOrgUsersItem),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetOrgUsersOutput' });

export let zToBackendGetOrgUsersResponse = makeToBackendResponseSchema({
  success: zToBackendGetOrgUsersOutput,
  error: zToBackendGetOrgUsersError
}).meta({ id: 'ToBackendGetOrgUsersResponse' });

assertTypesEqual<
  ToBackendGetOrgUsersOutput,
  z.infer<typeof zToBackendGetOrgUsersOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetOrgUsersResponse,
  z.infer<typeof zToBackendGetOrgUsersResponse>
>({ value: true });
