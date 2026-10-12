import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleAlreadyExistsError,
  zBackendRoleAlreadyExistsError
} from '#common/types/backend/errors/backend-role-already-exists-error';

export type CheckRoleDoesNotExistError = BackendRoleAlreadyExistsError;

export let zCheckRoleDoesNotExistError = zBackendRoleAlreadyExistsError;

assertTypesEqual<
  CheckRoleDoesNotExistError,
  z.infer<typeof zCheckRoleDoesNotExistError>
>({ value: true });
