import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleAlreadyExistsError,
  zBackendRoleAlreadyExistsError
} from '#common/types/backend/errors/backend-role-already-exists-error';

export type CheckRoleDoesNotExistResultError = BackendRoleAlreadyExistsError;

export let zCheckRoleDoesNotExistResultError = zBackendRoleAlreadyExistsError;

assertTypesEqual<
  CheckRoleDoesNotExistResultError,
  z.infer<typeof zCheckRoleDoesNotExistResultError>
>({ value: true });
