import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRoleGivenDoesNotExistError,
  zBackendRoleGivenDoesNotExistError
} from '#common/types/backend/errors/backend-role-given-does-not-exist-error';

export type GetRoleGivenCheckExistsResultError =
  BackendRoleGivenDoesNotExistError;

export let zGetRoleGivenCheckExistsResultError =
  zBackendRoleGivenDoesNotExistError;

assertTypesEqual<
  GetRoleGivenCheckExistsResultError,
  z.infer<typeof zGetRoleGivenCheckExistsResultError>
>({ value: true });
