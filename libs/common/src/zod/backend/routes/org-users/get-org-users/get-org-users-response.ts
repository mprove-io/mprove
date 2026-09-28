import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetOrgUsersOutput,
  zToBackendGetOrgUsersOutput
} from '#common/zod/backend/routes/org-users/get-org-users/get-org-users-output';
import {
  type ToBackendGetOrgUsersError,
  zToBackendGetOrgUsersError
} from './get-org-users-error';

export type ToBackendGetOrgUsersResponse = ToBackendResponseBase<
  'getOrgUsers',
  ToBackendGetOrgUsersOutput,
  ToBackendGetOrgUsersError
>;

export let zToBackendGetOrgUsersResponse = makeToBackendResponseSchema({
  operation: 'getOrgUsers',
  output: zToBackendGetOrgUsersOutput,
  error: zToBackendGetOrgUsersError
}).meta({ id: 'ToBackendGetOrgUsersResponse' });

assertTypesEqual<
  ToBackendGetOrgUsersResponse,
  z.infer<typeof zToBackendGetOrgUsersResponse>
>({ value: true });
