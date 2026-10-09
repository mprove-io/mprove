import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleGivenAlreadyExistsError,
  zBackendRoleGivenAlreadyExistsError
} from '#common/types/backend/errors/backend-role-given-already-exists-error';

export type CheckRoleGivenDoesNotExistResultError =
  BackendRoleGivenAlreadyExistsError;

export let zCheckRoleGivenDoesNotExistResultError =
  zBackendRoleGivenAlreadyExistsError;

assertTypesEqual<
  CheckRoleGivenDoesNotExistResultError,
  z.infer<typeof zCheckRoleGivenDoesNotExistResultError>
>({ value: true });
