import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RoleEntToTabError,
  zRoleEntToTabError
} from '#common/types/backend/function-errors/role-ent-to-tab-error';

export type GetRolesError = RoleEntToTabError;

export let zGetRolesError = zRoleEntToTabError;

assertTypesEqual<GetRolesError, z.infer<typeof zGetRolesError>>({
  value: true
});
