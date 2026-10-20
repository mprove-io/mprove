import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRolesDoNotExistError,
  zBackendRolesDoNotExistError
} from '#common/types/backend/errors/backend-roles-do-not-exist-error';
import {
  type DbRolesFindManyError,
  zDbRolesFindManyError
} from '#common/types/backend/function-errors/db/roles/db-roles-find-many-error';

export type CheckRolesExistError =
  | BackendRolesDoNotExistError
  | DbRolesFindManyError;

export let zCheckRolesExistError = z.union([
  zBackendRolesDoNotExistError,
  zDbRolesFindManyError
]);

assertTypesEqual<CheckRolesExistError, z.infer<typeof zCheckRolesExistError>>({
  value: true
});
