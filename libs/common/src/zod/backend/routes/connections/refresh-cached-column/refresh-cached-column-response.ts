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
  type ToBackendRefreshCachedColumnError,
  zToBackendRefreshCachedColumnError
} from './refresh-cached-column-error';

export type ToBackendRefreshCachedColumnOutput = {
  cachedColumn?: CachedColumn;
};

export type ToBackendRefreshCachedColumnResponse = ToBackendResponse<
  ToBackendRefreshCachedColumnOutput,
  ToBackendRefreshCachedColumnError
>;

export let zToBackendRefreshCachedColumnOutput = z
  .object({
    cachedColumn: zCachedColumn.nullish()
  })
  .meta({ id: 'ToBackendRefreshCachedColumnOutput' });

export let zToBackendRefreshCachedColumnResponse = makeToBackendResponseSchema({
  success: zToBackendRefreshCachedColumnOutput,
  error: zToBackendRefreshCachedColumnError
}).meta({ id: 'ToBackendRefreshCachedColumnResponse' });

assertTypesEqual<
  ToBackendRefreshCachedColumnOutput,
  z.infer<typeof zToBackendRefreshCachedColumnOutput>
>({ value: true });

assertTypesEqual<
  ToBackendRefreshCachedColumnResponse,
  z.infer<typeof zToBackendRefreshCachedColumnResponse>
>({ value: true });
