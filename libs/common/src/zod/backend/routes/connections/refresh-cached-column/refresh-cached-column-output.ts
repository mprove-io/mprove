import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumn,
  zCachedColumn
} from '#common/zod/backend/connections/cached-column';

export type ToBackendRefreshCachedColumnOutput = {
  cachedColumn?: CachedColumn;
};

export let zToBackendRefreshCachedColumnOutput = z
  .object({
    cachedColumn: zCachedColumn.nullish()
  })
  .meta({ id: 'ToBackendRefreshCachedColumnOutput' });

assertTypesEqual<
  ToBackendRefreshCachedColumnOutput,
  z.infer<typeof zToBackendRefreshCachedColumnOutput>
>({ value: true });
