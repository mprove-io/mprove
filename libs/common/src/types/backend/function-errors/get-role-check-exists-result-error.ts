import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleDoesNotExistError,
  zBackendRoleDoesNotExistError
} from '#common/types/backend/errors/backend-role-does-not-exist-error';
import {
  type RoleEntToTabResultError,
  zRoleEntToTabResultError
} from '#common/types/backend/function-errors/role-ent-to-tab-result-error';

export type GetRoleCheckExistsResultError =
  | BackendRoleDoesNotExistError
  | RoleEntToTabResultError;

export let zGetRoleCheckExistsResultError = z.union([
  zBackendRoleDoesNotExistError,
  zRoleEntToTabResultError
]);

assertTypesEqual<
  GetRoleCheckExistsResultError,
  z.infer<typeof zGetRoleCheckExistsResultError>
>({ value: true });
