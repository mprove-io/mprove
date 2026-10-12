import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRolesDoNotExistError,
  zBackendRolesDoNotExistError
} from '#common/types/backend/errors/backend-roles-do-not-exist-error';

export type CheckRolesExistError = BackendRolesDoNotExistError;

export let zCheckRolesExistError = zBackendRolesDoNotExistError;

assertTypesEqual<CheckRolesExistError, z.infer<typeof zCheckRolesExistError>>({
  value: true
});
