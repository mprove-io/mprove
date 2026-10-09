import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RoleEntToTabResultError,
  zRoleEntToTabResultError
} from '#common/types/backend/function-errors/role-ent-to-tab-result-error';

export type GetRolesResultError = RoleEntToTabResultError;

export let zGetRolesResultError = zRoleEntToTabResultError;

assertTypesEqual<GetRolesResultError, z.infer<typeof zGetRolesResultError>>({
  value: true
});
