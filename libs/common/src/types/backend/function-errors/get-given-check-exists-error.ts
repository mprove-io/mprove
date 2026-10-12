import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendGivenDoesNotExistError,
  zBackendGivenDoesNotExistError
} from '#common/types/backend/errors/backend-given-does-not-exist-error';
import {
  type GivenEntToTabError,
  zGivenEntToTabError
} from '#common/types/backend/function-errors/given-ent-to-tab-error';

export type GetGivenCheckExistsError =
  | BackendGivenDoesNotExistError
  | GivenEntToTabError;

export let zGetGivenCheckExistsError = z.union([
  zBackendGivenDoesNotExistError,
  zGivenEntToTabError
]);

assertTypesEqual<
  GetGivenCheckExistsError,
  z.infer<typeof zGetGivenCheckExistsError>
>({ value: true });
