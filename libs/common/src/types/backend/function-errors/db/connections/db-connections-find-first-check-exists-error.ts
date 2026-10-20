import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';

export type DbConnectionsFindFirstCheckExistsError =
  | ConnectionEntToTabError
  | BackendConnectionDoesNotExistError;

export let zDbConnectionsFindFirstCheckExistsError = z.union([
  zConnectionEntToTabError,
  zBackendConnectionDoesNotExistError
]);

assertTypesEqual<
  DbConnectionsFindFirstCheckExistsError,
  z.infer<typeof zDbConnectionsFindFirstCheckExistsError>
>({
  value: true
});
