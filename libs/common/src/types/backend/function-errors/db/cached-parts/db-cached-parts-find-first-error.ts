import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedPartEntToTabError,
  zCachedPartEntToTabError
} from '#common/types/backend/function-errors/cached-part-ent-to-tab-error';

export type DbCachedPartsFindFirstError = CachedPartEntToTabError;

export let zDbCachedPartsFindFirstError = zCachedPartEntToTabError;

assertTypesEqual<
  DbCachedPartsFindFirstError,
  z.infer<typeof zDbCachedPartsFindFirstError>
>({
  value: true
});
