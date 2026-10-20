import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendQueryDoesNotExistError,
  zBackendQueryDoesNotExistError
} from '#common/types/backend/errors/backend-query-does-not-exist-error';
import {
  type QueryEntToTabError,
  zQueryEntToTabError
} from '#common/types/backend/function-errors/query-ent-to-tab-error';

export type DbQueriesFindFirstCheckExistsError =
  | QueryEntToTabError
  | BackendQueryDoesNotExistError;

export let zDbQueriesFindFirstCheckExistsError = z.union([
  zQueryEntToTabError,
  zBackendQueryDoesNotExistError
]);

assertTypesEqual<
  DbQueriesFindFirstCheckExistsError,
  z.infer<typeof zDbQueriesFindFirstCheckExistsError>
>({
  value: true
});
