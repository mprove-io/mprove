import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleDoesNotExistError,
  zBackendRoleDoesNotExistError
} from '#common/types/backend/errors/backend-role-does-not-exist-error';
import {
  type RoleEntToTabError,
  zRoleEntToTabError
} from '#common/types/backend/function-errors/role-ent-to-tab-error';

export type DbRolesFindFirstCheckExistsError =
  | RoleEntToTabError
  | BackendRoleDoesNotExistError;

export let zDbRolesFindFirstCheckExistsError = z.union([
  zRoleEntToTabError,
  zBackendRoleDoesNotExistError
]);

assertTypesEqual<
  DbRolesFindFirstCheckExistsError,
  z.infer<typeof zDbRolesFindFirstCheckExistsError>
>({
  value: true
});
