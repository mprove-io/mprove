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
  type ToBackendGetCachedColumnsError,
  zToBackendGetCachedColumnsError
} from './get-cached-columns-error';

export type ToBackendGetCachedColumnsOutput = {
  cachedColumns: CachedColumn[];
};

export type ToBackendGetCachedColumnsResponse = ToBackendResponse<
  ToBackendGetCachedColumnsOutput,
  ToBackendGetCachedColumnsError
>;

export let zToBackendGetCachedColumnsOutput = z
  .object({
    cachedColumns: z.array(zCachedColumn)
  })
  .meta({ id: 'ToBackendGetCachedColumnsOutput' });

export let zToBackendGetCachedColumnsResponse = makeToBackendResponseSchema({
  success: zToBackendGetCachedColumnsOutput,
  error: zToBackendGetCachedColumnsError
}).meta({ id: 'ToBackendGetCachedColumnsResponse' });

assertTypesEqual<
  ToBackendGetCachedColumnsOutput,
  z.infer<typeof zToBackendGetCachedColumnsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetCachedColumnsResponse,
  z.infer<typeof zToBackendGetCachedColumnsResponse>
>({ value: true });
