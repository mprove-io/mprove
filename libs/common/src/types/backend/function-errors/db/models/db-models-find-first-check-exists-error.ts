import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/types/backend/errors/backend-model-does-not-exist-error';
import {
  type ModelEntToTabError,
  zModelEntToTabError
} from '#common/types/backend/function-errors/model-ent-to-tab-error';

export type DbModelsFindFirstCheckExistsError =
  | ModelEntToTabError
  | BackendModelDoesNotExistError;

export let zDbModelsFindFirstCheckExistsError = z.union([
  zModelEntToTabError,
  zBackendModelDoesNotExistError
]);

assertTypesEqual<
  DbModelsFindFirstCheckExistsError,
  z.infer<typeof zDbModelsFindFirstCheckExistsError>
>({
  value: true
});
