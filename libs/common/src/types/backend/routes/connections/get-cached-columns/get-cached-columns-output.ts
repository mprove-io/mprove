import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumn,
  zCachedColumn
} from '#common/types/backend/parts/connections/cached-column';

export type ToBackendGetCachedColumnsOutput = {
  cachedColumns: CachedColumn[];
};

export let zToBackendGetCachedColumnsOutput = z
  .object({
    cachedColumns: z.array(zCachedColumn)
  })
  .meta({ id: 'ToBackendGetCachedColumnsOutput' });

assertTypesEqual<
  ToBackendGetCachedColumnsOutput,
  z.infer<typeof zToBackendGetCachedColumnsOutput>
>({ value: true });
