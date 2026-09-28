import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetCachedColumnsOutput,
  zToBackendGetCachedColumnsOutput
} from '#common/zod/backend/routes/connections/get-cached-columns/get-cached-columns-output';
import {
  type ToBackendGetCachedColumnsError,
  zToBackendGetCachedColumnsError
} from './get-cached-columns-error';

export type ToBackendGetCachedColumnsResponse = ToBackendResponseBase<
  'getCachedColumns',
  ToBackendGetCachedColumnsOutput,
  ToBackendGetCachedColumnsError
>;

export let zToBackendGetCachedColumnsResponse = makeToBackendResponseSchema({
  operation: 'getCachedColumns',
  output: zToBackendGetCachedColumnsOutput,
  error: zToBackendGetCachedColumnsError
}).meta({ id: 'ToBackendGetCachedColumnsResponse' });

assertTypesEqual<
  ToBackendGetCachedColumnsResponse,
  z.infer<typeof zToBackendGetCachedColumnsResponse>
>({ value: true });
