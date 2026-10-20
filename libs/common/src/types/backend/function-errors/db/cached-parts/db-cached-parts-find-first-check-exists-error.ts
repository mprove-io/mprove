import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCachedPartDoesNotExistError,
  zBackendCachedPartDoesNotExistError
} from '#common/types/backend/errors/backend-cached-part-does-not-exist-error';
import {
  type CachedPartEntToTabError,
  zCachedPartEntToTabError
} from '#common/types/backend/function-errors/cached-part-ent-to-tab-error';

export type DbCachedPartsFindFirstCheckExistsError =
  | CachedPartEntToTabError
  | BackendCachedPartDoesNotExistError;

export let zDbCachedPartsFindFirstCheckExistsError = z.union([
  zCachedPartEntToTabError,
  zBackendCachedPartDoesNotExistError
]);

assertTypesEqual<
  DbCachedPartsFindFirstCheckExistsError,
  z.infer<typeof zDbCachedPartsFindFirstCheckExistsError>
>({
  value: true
});
