import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendCachedColumnDoesNotExistError,
  zBackendCachedColumnDoesNotExistError
} from '#common/types/backend/errors/backend-cached-column-does-not-exist-error';
import {
  type CachedColumnEntToTabError,
  zCachedColumnEntToTabError
} from '#common/types/backend/function-errors/cached-column-ent-to-tab-error';

export type DbCachedColumnsFindFirstCheckExistsError =
  | CachedColumnEntToTabError
  | BackendCachedColumnDoesNotExistError;

export let zDbCachedColumnsFindFirstCheckExistsError = z.union([
  zCachedColumnEntToTabError,
  zBackendCachedColumnDoesNotExistError
]);

assertTypesEqual<
  DbCachedColumnsFindFirstCheckExistsError,
  z.infer<typeof zDbCachedColumnsFindFirstCheckExistsError>
>({
  value: true
});
