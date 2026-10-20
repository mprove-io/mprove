import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumnEntToTabError,
  zCachedColumnEntToTabError
} from '#common/types/backend/function-errors/cached-column-ent-to-tab-error';

export type DbCachedColumnsFindManyError = CachedColumnEntToTabError;

export let zDbCachedColumnsFindManyError = zCachedColumnEntToTabError;

assertTypesEqual<
  DbCachedColumnsFindManyError,
  z.infer<typeof zDbCachedColumnsFindManyError>
>({
  value: true
});
