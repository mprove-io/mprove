import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ServerUsersItem,
  zServerUsersItem
} from '#common/zod/backend/users/server-users-item';
import {
  type ToBackendGetServerUsersError,
  zToBackendGetServerUsersError
} from './get-server-users-error';

export type ToBackendGetServerUsersOutput = {
  serverUsersList: ServerUsersItem[];
  total: number;
};

export type ToBackendGetServerUsersResponse = ToBackendResponse<
  ToBackendGetServerUsersOutput,
  ToBackendGetServerUsersError
>;

export let zToBackendGetServerUsersOutput = z
  .object({
    serverUsersList: z.array(zServerUsersItem),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetServerUsersOutput' });

export let zToBackendGetServerUsersResponse = makeToBackendResponseSchema({
  success: zToBackendGetServerUsersOutput,
  error: zToBackendGetServerUsersError
}).meta({ id: 'ToBackendGetServerUsersResponse' });

assertTypesEqual<
  ToBackendGetServerUsersOutput,
  z.infer<typeof zToBackendGetServerUsersOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetServerUsersResponse,
  z.infer<typeof zToBackendGetServerUsersResponse>
>({ value: true });
