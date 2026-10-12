import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleGivenAlreadyExistsError,
  zBackendRoleGivenAlreadyExistsError
} from '#common/types/backend/errors/backend-role-given-already-exists-error';

export type CheckRoleGivenDoesNotExistError =
  BackendRoleGivenAlreadyExistsError;

export let zCheckRoleGivenDoesNotExistError =
  zBackendRoleGivenAlreadyExistsError;

assertTypesEqual<
  CheckRoleGivenDoesNotExistError,
  z.infer<typeof zCheckRoleGivenDoesNotExistError>
>({ value: true });
