import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RoleEntToTabResultError,
  zRoleEntToTabResultError
} from '#common/types/backend/function-errors/role-ent-to-tab-result-error';

export type GetApiRolesResultError = RoleEntToTabResultError;

export let zGetApiRolesResultError = zRoleEntToTabResultError;

assertTypesEqual<
  GetApiRolesResultError,
  z.infer<typeof zGetApiRolesResultError>
>({ value: true });
