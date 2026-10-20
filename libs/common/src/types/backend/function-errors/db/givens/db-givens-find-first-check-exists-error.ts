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

export type DbGivensFindFirstCheckExistsError =
  | GivenEntToTabError
  | BackendGivenDoesNotExistError;

export let zDbGivensFindFirstCheckExistsError = z.union([
  zGivenEntToTabError,
  zBackendGivenDoesNotExistError
]);

assertTypesEqual<
  DbGivensFindFirstCheckExistsError,
  z.infer<typeof zDbGivensFindFirstCheckExistsError>
>({
  value: true
});
