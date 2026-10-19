import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRolesDoNotExistError,
  zBackendRolesDoNotExistError
} from '#common/types/backend/errors/backend-roles-do-not-exist-error';
import {
  type RoleEntToTabError,
  zRoleEntToTabError
} from '#common/types/backend/function-errors/role-ent-to-tab-error';

export type CheckRolesExistError =
  | BackendRolesDoNotExistError
  | RoleEntToTabError;

export let zCheckRolesExistError = z.union([
  zBackendRolesDoNotExistError,
  zRoleEntToTabError
]);

assertTypesEqual<CheckRolesExistError, z.infer<typeof zCheckRolesExistError>>({
  value: true
});
