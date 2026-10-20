import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumnEntToTabError,
  zCachedColumnEntToTabError
} from '#common/types/backend/function-errors/cached-column-ent-to-tab-error';

export type DbCachedColumnsFindFirstError = CachedColumnEntToTabError;

export let zDbCachedColumnsFindFirstError = zCachedColumnEntToTabError;

assertTypesEqual<
  DbCachedColumnsFindFirstError,
  z.infer<typeof zDbCachedColumnsFindFirstError>
>({
  value: true
});
