import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendUserDoesNotExistError,
  zBackendUserDoesNotExistError
} from '#common/types/backend/errors/backend-user-does-not-exist-error';
import {
  type UserEntToTabError,
  zUserEntToTabError
} from '#common/types/backend/function-errors/user-ent-to-tab-error';

export type DbUsersFindFirstCheckExistsError =
  | UserEntToTabError
  | BackendUserDoesNotExistError;

export let zDbUsersFindFirstCheckExistsError = z.union([
  zUserEntToTabError,
  zBackendUserDoesNotExistError
]);

assertTypesEqual<
  DbUsersFindFirstCheckExistsError,
  z.infer<typeof zDbUsersFindFirstCheckExistsError>
>({
  value: true
});
