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

export type GetRoleCheckExistsError =
  | BackendRoleDoesNotExistError
  | RoleEntToTabError;

export let zGetRoleCheckExistsError = z.union([
  zBackendRoleDoesNotExistError,
  zRoleEntToTabError
]);

assertTypesEqual<
  GetRoleCheckExistsError,
  z.infer<typeof zGetRoleCheckExistsError>
>({ value: true });
