import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendClearCachedColumnOutput,
  zToBackendClearCachedColumnOutput
} from '#common/zod/backend/routes/connections/clear-cached-column/clear-cached-column-output';
import {
  type ToBackendClearCachedColumnError,
  zToBackendClearCachedColumnError
} from './clear-cached-column-error';

export type ToBackendClearCachedColumnResponse = ToBackendResponseBase<
  'clearCachedColumn',
  ToBackendClearCachedColumnOutput,
  ToBackendClearCachedColumnError
>;

export let zToBackendClearCachedColumnResponse = makeToBackendResponseSchema({
  operation: 'clearCachedColumn',
  output: zToBackendClearCachedColumnOutput,
  error: zToBackendClearCachedColumnError
}).meta({ id: 'ToBackendClearCachedColumnResponse' });

assertTypesEqual<
  ToBackendClearCachedColumnResponse,
  z.infer<typeof zToBackendClearCachedColumnResponse>
>({ value: true });
