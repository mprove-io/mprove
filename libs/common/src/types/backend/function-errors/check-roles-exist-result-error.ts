import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRolesDoNotExistError,
  zBackendRolesDoNotExistError
} from '#common/types/backend/errors/backend-roles-do-not-exist-error';

export type CheckRolesExistResultError = BackendRolesDoNotExistError;

export let zCheckRolesExistResultError = zBackendRolesDoNotExistError;

assertTypesEqual<
  CheckRolesExistResultError,
  z.infer<typeof zCheckRolesExistResultError>
>({ value: true });
