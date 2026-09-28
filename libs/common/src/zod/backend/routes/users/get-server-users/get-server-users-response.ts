import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetServerUsersOutput,
  zToBackendGetServerUsersOutput
} from '#common/zod/backend/routes/users/get-server-users/get-server-users-output';
import {
  type ToBackendGetServerUsersError,
  zToBackendGetServerUsersError
} from './get-server-users-error';

export type ToBackendGetServerUsersResponse = ToBackendResponseBase<
  'getServerUsers',
  ToBackendGetServerUsersOutput,
  ToBackendGetServerUsersError
>;

export let zToBackendGetServerUsersResponse = makeToBackendResponseSchema({
  operation: 'getServerUsers',
  output: zToBackendGetServerUsersOutput,
  error: zToBackendGetServerUsersError
}).meta({ id: 'ToBackendGetServerUsersResponse' });

assertTypesEqual<
  ToBackendGetServerUsersResponse,
  z.infer<typeof zToBackendGetServerUsersResponse>
>({ value: true });
