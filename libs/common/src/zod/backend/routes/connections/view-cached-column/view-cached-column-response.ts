import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumn,
  zCachedColumn
} from '#common/zod/backend/connections/cached-column';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendViewCachedColumnError,
  zToBackendViewCachedColumnError
} from './view-cached-column-error';

export type ToBackendViewCachedColumnOutput = {
  cachedColumn?: CachedColumn;
  columnNames: string[];
  rows: string[][];
  errorMessage?: string;
};

export type ToBackendViewCachedColumnResponse = ToBackendResponse<
  ToBackendViewCachedColumnOutput,
  ToBackendViewCachedColumnError
>;

export let zToBackendViewCachedColumnOutput = z
  .object({
    cachedColumn: zCachedColumn.nullish(),
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendViewCachedColumnOutput' });

export let zToBackendViewCachedColumnResponse = makeToBackendResponseSchema({
  success: zToBackendViewCachedColumnOutput,
  error: zToBackendViewCachedColumnError
}).meta({ id: 'ToBackendViewCachedColumnResponse' });

assertTypesEqual<
  ToBackendViewCachedColumnOutput,
  z.infer<typeof zToBackendViewCachedColumnOutput>
>({ value: true });

assertTypesEqual<
  ToBackendViewCachedColumnResponse,
  z.infer<typeof zToBackendViewCachedColumnResponse>
>({ value: true });
