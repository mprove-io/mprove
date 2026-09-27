import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendClearCachedColumnError,
  zToBackendClearCachedColumnError
} from './clear-cached-column-error';

export type ToBackendClearCachedColumnOutput = Record<string, never>;

export type ToBackendClearCachedColumnResponse = ToBackendResponse<
  ToBackendClearCachedColumnOutput,
  ToBackendClearCachedColumnError
>;

export let zToBackendClearCachedColumnOutput = z
  .object({})
  .meta({ id: 'ToBackendClearCachedColumnOutput' });

export let zToBackendClearCachedColumnResponse = makeToBackendResponseSchema({
  success: zToBackendClearCachedColumnOutput,
  error: zToBackendClearCachedColumnError
}).meta({ id: 'ToBackendClearCachedColumnResponse' });

assertTypesEqual<
  ToBackendClearCachedColumnOutput,
  z.infer<typeof zToBackendClearCachedColumnOutput>
>({ value: true });

assertTypesEqual<
  ToBackendClearCachedColumnResponse,
  z.infer<typeof zToBackendClearCachedColumnResponse>
>({ value: true });
