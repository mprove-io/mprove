import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumn,
  zCachedColumn
} from '#common/types/backend/parts/connections/cached-column';

export type ToBackendViewCachedColumnOutput = {
  cachedColumn?: CachedColumn;
  columnNames: string[];
  rows: string[][];
  errorMessage?: string;
};

export let zToBackendViewCachedColumnOutput = z
  .object({
    cachedColumn: zCachedColumn.nullish(),
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendViewCachedColumnOutput' });

assertTypesEqual<
  ToBackendViewCachedColumnOutput,
  z.infer<typeof zToBackendViewCachedColumnOutput>
>({ value: true });
