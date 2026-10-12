import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleGivenDoesNotExistError,
  zBackendRoleGivenDoesNotExistError
} from '#common/types/backend/errors/backend-role-given-does-not-exist-error';

export type GetRoleGivenCheckExistsError = BackendRoleGivenDoesNotExistError;

export let zGetRoleGivenCheckExistsError = zBackendRoleGivenDoesNotExistError;

assertTypesEqual<
  GetRoleGivenCheckExistsError,
  z.infer<typeof zGetRoleGivenCheckExistsError>
>({ value: true });
