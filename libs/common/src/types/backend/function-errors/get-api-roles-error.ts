import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbRolesFindManyError,
  zDbRolesFindManyError
} from '#common/types/backend/function-errors/db/roles/db-roles-find-many-error';

export type GetApiRolesError = DbRolesFindManyError;

export let zGetApiRolesError = zDbRolesFindManyError;

assertTypesEqual<GetApiRolesError, z.infer<typeof zGetApiRolesError>>({
  value: true
});
