import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RoleEntToTabError,
  zRoleEntToTabError
} from '#common/types/backend/function-errors/role-ent-to-tab-error';

export type DbRolesFindManyError = RoleEntToTabError;

export let zDbRolesFindManyError = zRoleEntToTabError;

assertTypesEqual<DbRolesFindManyError, z.infer<typeof zDbRolesFindManyError>>({
  value: true
});
