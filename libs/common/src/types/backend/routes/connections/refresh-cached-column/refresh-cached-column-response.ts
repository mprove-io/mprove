import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendRefreshCachedColumnOutput,
  zToBackendRefreshCachedColumnOutput
} from '#common/types/backend/routes/connections/refresh-cached-column/refresh-cached-column-output';
import {
  type ToBackendRefreshCachedColumnError,
  zToBackendRefreshCachedColumnError
} from './refresh-cached-column-error';

export type ToBackendRefreshCachedColumnResponse = ToBackendResponseBase<
  'refreshCachedColumn',
  ToBackendRefreshCachedColumnOutput,
  ToBackendRefreshCachedColumnError
>;

export let zToBackendRefreshCachedColumnResponse = makeToBackendResponseSchema({
  operation: 'refreshCachedColumn',
  output: zToBackendRefreshCachedColumnOutput,
  error: zToBackendRefreshCachedColumnError
}).meta({ id: 'ToBackendRefreshCachedColumnResponse' });

assertTypesEqual<
  ToBackendRefreshCachedColumnResponse,
  z.infer<typeof zToBackendRefreshCachedColumnResponse>
>({ value: true });
