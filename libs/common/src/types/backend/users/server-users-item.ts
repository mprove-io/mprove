import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ServerUsersMembershipItem,
  zServerUsersMembershipItem
} from '#common/types/backend/users/server-users-membership-item';

export type ServerUsersItem = {
  userId: string;
  avatarSmall?: string;
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdTs?: number;
  memberships: ServerUsersMembershipItem[];
};

export let zServerUsersItem = z
  .object({
    userId: z.string(),
    avatarSmall: z.string().nullish(),
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    createdTs: z.number().nullish(),
    memberships: z.array(zServerUsersMembershipItem)
  })
  .meta({ id: 'ServerUsersItem' });

assertTypesEqual<ServerUsersItem, z.infer<typeof zServerUsersItem>>({
  value: true
});
