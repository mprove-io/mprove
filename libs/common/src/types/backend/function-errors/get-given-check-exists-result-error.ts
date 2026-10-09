import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendGivenDoesNotExistError,
  zBackendGivenDoesNotExistError
} from '#common/types/backend/errors/backend-given-does-not-exist-error';
import {
  type GivenEntToTabResultError,
  zGivenEntToTabResultError
} from '#common/types/backend/function-errors/given-ent-to-tab-result-error';

export type GetGivenCheckExistsResultError =
  | BackendGivenDoesNotExistError
  | GivenEntToTabResultError;

export let zGetGivenCheckExistsResultError = z.union([
  zBackendGivenDoesNotExistError,
  zGivenEntToTabResultError
]);

assertTypesEqual<
  GetGivenCheckExistsResultError,
  z.infer<typeof zGetGivenCheckExistsResultError>
>({ value: true });
