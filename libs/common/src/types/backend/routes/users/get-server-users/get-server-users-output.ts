import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ServerUsersItem,
  zServerUsersItem
} from '#common/types/backend/parts/users/server-users-item';

export type ToBackendGetServerUsersOutput = {
  serverUsersList: ServerUsersItem[];
  total: number;
};

export let zToBackendGetServerUsersOutput = z
  .object({
    serverUsersList: z.array(zServerUsersItem),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetServerUsersOutput' });

assertTypesEqual<
  ToBackendGetServerUsersOutput,
  z.infer<typeof zToBackendGetServerUsersOutput>
>({ value: true });
